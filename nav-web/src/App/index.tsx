import { useEffect, useState } from 'react'
import { css } from '@emotion/css'
import { clearCache } from '../util/request'
import { useBookmarks } from '../util/bookmark'
import { getRedirectHref } from '../util/search'
import { useToken } from '../util/security'
import { isNotBlank } from '../util/string'
import SearchLogo from './SearchLogo'
import SearchInput from './SearchInput'
import SearchSuggests from './SearchSuggests'
import UserBookmarks from './UserBookmarks'
import OperatorsBar from './OperatorsBar'
import ModalLogin from './ModalLogin'
import ModalBookmark from './ModalBookmark'

export default function App() {
  const [token, setToken, removeToken] = useToken()
  const [bookmarks, setBookmarks, fetchBookmarks, saveBookmarks, fetchingBookmarks] = useBookmarks()

  const [search, setSearch] = useState('')

  const [showLogin, setShowLogin] = useState(false)
  const [showAdd, setShowAdd] = useState(false)

  const [editing, setEditing] = useState(false)

  useEffect(() => {
    token && fetchBookmarks()
  }, [token])

  return (
    <div className={Style.container}>
      <SearchLogo />

      <SearchInput value={search} onInput={setSearch} onSearch={() => (location.href = getRedirectHref(search))} />

      {search.length > 0 && <SearchSuggests search={search} />}

      {search.length <= 0 && isNotBlank(token) && (
        <UserBookmarks editing={editing} bookmarks={bookmarks} onSort={setBookmarks} />
      )}

      <OperatorsBar
        fetchingBookmarks={fetchingBookmarks}
        loggedIn={isNotBlank(token)}
        editing={editing}
        onLogin={() => setShowLogin(true)}
        onLogout={removeToken}
        onRefresh={() => {
          clearCache()
          setBookmarks([])
          fetchBookmarks()
        }}
        onEdit={() => setEditing(true)}
        onCancel={() => fetchBookmarks().then(() => setEditing(false))}
        onSave={() => saveBookmarks().then(() => setEditing(false))}
        onAdd={() => setShowAdd(true)}
      />

      <ModalLogin
        show={showLogin}
        onSuccess={token => {
          setToken(token)
          setShowLogin(false)
        }}
        onClose={() => setShowLogin(false)}
      />

      <ModalBookmark
        show={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={bookmark => {
          setBookmarks(prev => [...prev, bookmark])
          setShowAdd(false)
        }}
      />
    </div>
  )
}

const Style = {
  container: css({
    position: 'fixed',
    left: 0,
    right: 0,
    top: '15%',
    bottom: '8px',
    width: '600px',
    margin: 'auto',
    fontSize: '16px',
    '*': {
      fontFamily: 'sans-serif',
      boxSizing: 'border-box',
      fontSize: 'inherit',
      userSelect: 'none',
    },
  }),
}
