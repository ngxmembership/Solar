// Builds public/forum/forum.json from this repo's GitHub Discussions (runs in the deploy workflow,
// which is triggered by every new topic/reply and every 6 hours). If GitHub is unreachable,
// the last published forum.json is reused so the forum never goes blank.
import { mkdir, writeFile } from 'node:fs/promises'

const [owner, name] = (process.env.GITHUB_REPOSITORY || 'ngxmembership/Solar').split('/')
const token = process.env.GITHUB_TOKEN
const OUT_DIR = 'public/forum'
const LIVE = `https://${owner.toLowerCase()}.github.io/${name}/forum/forum.json`

const QUERY = `query($owner: String!, $name: String!, $cursor: String) {
  repository(owner: $owner, name: $name) {
    discussions(first: 50, after: $cursor, orderBy: { field: UPDATED_AT, direction: DESC }) {
      pageInfo { hasNextPage endCursor }
      nodes {
        number title url createdAt bodyText bodyHTML upvoteCount
        category { slug }
        author { __typename login avatarUrl url }
        reactions { totalCount }
        first: comments(first: 1) { nodes { bodyText author { login avatarUrl url } } }
        all: comments(first: 100) { totalCount nodes { createdAt author { login avatarUrl url } replies(last: 1) { totalCount nodes { createdAt author { login avatarUrl url } } } } }
      }
    }
  }
}`

const person = (a) => (a ? { login: a.login, avatar: a.avatarUrl, url: a.url } : null)
// Topics opened on the site are created by the giscus bot; the real author wrote the first comment.
const isBot = (a) => !a || a.__typename === 'Bot' || /^giscus/i.test(a.login)
const clip = (s, n) => {
  const t = s.replace(/\s+/g, ' ').trim()
  return t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t
}

function toTopic(n) {
  const viaSite = isBot(n.author)
  const opener = n.first.nodes[0]
  const author = viaSite ? person(opener?.author) : person(n.author)
  const people = new Set()
  if (author) people.add(author.login)
  let lastAt = n.createdAt
  let lastAuthor = author
  let replies = n.all.totalCount
  const seen = (at, who) => {
    if (who) people.add(who.login)
    if (at > lastAt) {
      lastAt = at
      lastAuthor = person(who)
    }
  }
  for (const c of n.all.nodes) {
    seen(c.createdAt, c.author)
    replies += c.replies.totalCount
    const r = c.replies.nodes[0]
    if (r) seen(r.createdAt, r.author)
  }
  if (viaSite && opener) replies -= 1
  return {
    number: n.number,
    rawTitle: n.title,
    category: n.category.slug,
    url: n.url,
    author,
    createdAt: n.createdAt,
    lastActivityAt: lastAt,
    lastAuthor,
    replies: Math.max(0, replies),
    reactions: n.reactions.totalCount + n.upvoteCount,
    excerpt: clip((viaSite ? opener?.bodyText : n.bodyText) ?? '', 220),
    bodyHTML: viaSite ? '' : n.bodyHTML,
    viaSite,
    people: [...people],
  }
}

async function gql(variables) {
  const r = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { authorization: `bearer ${token}`, 'content-type': 'application/json', 'user-agent': 'solar-forum-build' },
    body: JSON.stringify({ query: QUERY, variables }),
  })
  if (!r.ok) throw new Error(`GraphQL HTTP ${r.status}`)
  return r.json()
}

async function collect() {
  const topics = []
  let cursor = null
  for (let page = 0; page < 6; page++) {
    const res = await gql({ owner, name, cursor })
    if (res.errors?.length) throw new Error(res.errors[0].message)
    const conn = res.data?.repository?.discussions
    if (!conn) throw new Error('unexpected response')
    for (const n of conn.nodes) topics.push(toTopic(n))
    if (!conn.pageInfo.hasNextPage) break
    cursor = conn.pageInfo.endCursor
  }
  return { generatedAt: new Date().toISOString(), topics }
}

let payload
try {
  if (!token) throw new Error('GITHUB_TOKEN is not set')
  payload = await collect()
  console.log(`forum: ${payload.topics.length} topics`)
} catch (err) {
  console.warn(`forum: live fetch failed — ${err.message}`)
  try {
    const r = await fetch(LIVE)
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    payload = await r.json()
    console.warn('forum: reusing the last published forum.json')
  } catch {
    payload = { generatedAt: new Date().toISOString(), topics: [] }
  }
}
await mkdir(OUT_DIR, { recursive: true })
await writeFile(`${OUT_DIR}/forum.json`, JSON.stringify(payload))
