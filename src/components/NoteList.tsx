import type { VaultEntry, SidebarSelection } from '../types'
import './NoteList.css'

interface NoteListProps {
  entries: VaultEntry[]
  selection: SidebarSelection
}

/** Check if a wikilink array (e.g. belongsTo) references a given entry by path stem */
function refsMatch(refs: string[], entry: VaultEntry): boolean {
  // Extract the path stem: /Users/luca/Laputa/project/26q1-laputa-app.md → project/26q1-laputa-app
  const stem = entry.path.replace(/^.*\/Laputa\//, '').replace(/\.md$/, '')
  return refs.some((ref) => {
    const inner = ref.replace(/^\[\[/, '').replace(/\]\]$/, '')
    return inner === stem
  })
}

function filterEntries(entries: VaultEntry[], selection: SidebarSelection): VaultEntry[] {
  switch (selection.kind) {
    case 'filter':
      switch (selection.filter) {
        case 'all':
          return entries
        case 'people':
          return entries.filter((e) => e.isA === 'Person')
        case 'events':
          return entries.filter((e) => e.isA === 'Event')
        case 'favorites':
          // TODO: Implement favorites (needs a "favorite" field in frontmatter)
          return []
        case 'trash':
          // TODO: Implement trash (needs deleted/archived status)
          return []
      }
      break
    case 'sectionGroup':
      return entries.filter((e) => e.isA === selection.type)
    case 'entity': {
      const pinned = selection.entry
      const children = entries.filter(
        (e) => e.path !== pinned.path && refsMatch(e.belongsTo, pinned)
      )
      return [pinned, ...children]
    }
    case 'topic': {
      const topic = selection.entry
      return entries.filter((e) => refsMatch(e.relatedTo, topic))
    }
  }
}

export function NoteList({ entries, selection }: NoteListProps) {
  const filtered = filterEntries(entries, selection)

  return (
    <div className="note-list">
      <div className="note-list__header">
        <h3>Notes</h3>
        <span className="note-list__count">{filtered.length}</span>
      </div>
      <div className="note-list__items">
        {filtered.length === 0 ? (
          <div className="note-list__empty">No notes found</div>
        ) : (
          filtered.map((entry, i) => (
            <div
              key={entry.path}
              className={`note-list__item${
                selection.kind === 'entity' && i === 0 ? ' note-list__item--pinned' : ''
              }`}
            >
              <div className="note-list__title">{entry.title}</div>
              <div className="note-list__meta">
                {entry.isA && <span className="note-list__type">{entry.isA}</span>}
                {entry.status && <span className="note-list__status">{entry.status}</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
