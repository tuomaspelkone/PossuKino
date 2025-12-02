import React, { useEffect, useRef, useState } from 'react';
import './groupPage.css';
import SearchBar from './searchBar';
import MovieDetail from './movieDetail';

function GroupPage() {
  const [groups, setGroups] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [showMembersList, setShowMembersList] = useState(false);
    const [memberUsernames, setMemberUsernames] = useState([]);
    const [modalGroupName, setModalGroupName] = useState('');
    const [showAddSearch, setShowAddSearch] = useState(false);
    const [searchAddResults, setSearchAddResults] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [addSearchTerm, setAddSearchTerm] = useState('');
    const [addSelectedGenres, setAddSelectedGenres] = useState([]);
    const [addCertification, setAddCertification] = useState('');
    const [addResults, setAddResults] = useState([]);
    const [addLoading, setAddLoading] = useState(false);
    const [selectedAddMovie, setSelectedAddMovie] = useState(null);
    const [addReason, setAddReason] = useState('');
    const [genresList, setGenresList] = useState([]);
    const [viewingMovieId, setViewingMovieId] = useState(null);
    const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [addMemberUsername, setAddMemberUsername] = useState('');
    const carouselRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatText, setChatText] = useState('');
    const [userCache, setUserCache] = useState({}); // { [user_id]: { username, avatar_url } }
    const chatListRef = useRef(null);
    const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  useEffect(() => {
    let mounted = true;
    const apiBase = API_BASE;
    const apiBaseNoSlash = apiBase.replace(/\/$/, '');

    async function fetchGroups() {
      try {
        setLoading(true);
        const [resGroups, resMembers] = await Promise.all([
          fetch(`${apiBaseNoSlash}/group`),
          fetch(`${apiBaseNoSlash}/group_members`),
        ]);
        if (!resGroups.ok) throw new Error(`Groups HTTP ${resGroups.status}`);
        if (!resMembers.ok) throw new Error(`Group members HTTP ${resMembers.status}`);
        const groupsData = await resGroups.json();
        const membersData = await resMembers.json();
        if (!mounted) return;
        const groupsArr = Array.isArray(groupsData) ? groupsData : [];
        const membersArr = Array.isArray(membersData) ? membersData : [];

        // build a map { group_id: count } and mark if current user is a member
        const counts = {};
        const joinedMap = {};
        const stored = localStorage.getItem('user');
        let currentUserId = null;
        try {
          const parsed = stored ? JSON.parse(stored) : null;
          currentUserId = parsed && parsed.user_id ? Number(parsed.user_id) : null;
        } catch (e) { currentUserId = null; }

        for (const m of membersArr) {
          const gid = Number(m.group_id);
          if (!gid) continue;
          counts[gid] = (counts[gid] || 0) + 1;
          if (currentUserId && Number(m.user_id) === currentUserId) {
            joinedMap[gid] = true;
          }
        }

        // enrich groups with counts and joined flags
        const enriched = groupsArr.map(g => ({ ...g, member_count: counts[Number(g.group_id)] || 0, joined: !!joinedMap[Number(g.group_id)] }));
        if (!mounted) return;
        setGroups(enriched);
        setLoading(false);
        setError(null);
      } catch (e) {
        if (!mounted) return;
        console.error('fetchGroups error', e);
        setError(e.message || String(e));
      }
    }
    fetchGroups();
    return () => { mounted = false; };
  }, []);

  async function joinGroup(group_id) {
    const stored = localStorage.getItem('user');
    if (!stored) {
      window.alert('Et ole kirjautunut sisään. Kirjaudu sisään liittyäksesi ryhmään.');
      return;
    }
    let parsed;
    try { parsed = JSON.parse(stored); } catch (e) { parsed = null; }
    if (!parsed || !parsed.user_id) {
      window.alert('Et ole kirjautunut sisään.');
      return;
    }

    const apiBase = API_BASE;
    const apiBaseNoSlash = apiBase.replace(/\/$/, '');

    try {
      const body = { user_id: Number(parsed.user_id), group_id: Number(group_id), group_admin: false };
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${apiBaseNoSlash}/group_members`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status}: ${txt}`);
      }
      const result = await res.json();

      // update local state: increment member_count and mark joined
      setGroups(prev => prev.map(g => g.group_id === group_id ? { ...g, member_count: (Number(g.member_count)||0) + 1, joined: true } : g));
    } catch (err) {
      console.error('Join failed', err);
      window.alert('Liittyminen epäonnistui: ' + (err.message || 'virhe'));
    }
  }

  async function createGroup() {
    const stored = localStorage.getItem('user');
    if (!stored) {
      window.alert('Et ole kirjautunut sisään. Kirjaudu sisään luodaksesi ryhmän.');
      return;
    }
    let parsed;
    try { parsed = JSON.parse(stored); } catch (e) { parsed = null; }
    if (!parsed || !parsed.user_id) {
      window.alert('Et ole kirjautunut sisään.');
      return;
    }
    if (!newName || newName.trim().length === 0) {
      window.alert('Anna ryhmälle nimi.');
      return;
    }

    const apiBase = API_BASE;
    const apiBaseNoSlash = apiBase.replace(/\/$/, '');

    try {
      // create group
      const body = { user_id: Number(parsed.user_id), group_name: newName.trim(), group_description: newDesc.trim() };
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${apiBaseNoSlash}/group`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status}: ${txt}`);
      }
      const created = await res.json();

      // creator is now added as admin server-side

      // add to UI
      const newGroup = {
        ...created,
        member_count: 1,
        joined: true,
      };
      setGroups(prev => [newGroup, ...prev]);
      setShowCreate(false);
      setNewName('');
      setNewDesc('');
    } catch (err) {
      console.error('Create group failed', err);
      window.alert('Ryhmänt luonti epäonnistui: ' + (err.message || 'virhe'));
    }
  }

  // open group detail view
  function openGroup(group) {
    setSelectedGroup({ ...group, movies: group.movies || [] });
    setShowMembersList(false);
    setMemberUsernames([]);
    setShowAddSearch(false);
    setSearchAddResults([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // load persisted movies for this group
    fetchGroupMovies(group.group_id);
    // check if current user is admin of this group
    checkAdminStatus(group.group_id);
    // reflect group id in hash for deep link
    try {
      const current = String(window.location.hash || '');
      const desired = `#groups?gid=${group.group_id}`;
      if (current !== desired) window.location.hash = desired;
    } catch (e) {}
  }

  function closeGroup() {
    setSelectedGroup(null);
    setShowMembersList(false);
    setMemberUsernames([]);
    try { if (window.location.hash !== '#groups') window.location.hash = '#groups'; } catch (e) {}
  }

  async function loadMemberUsernames(group_id, group_name) {
    try {
      const apiBase = API_BASE;
      const apiBaseNoSlash = apiBase.replace(/\/$/, '');
      const resMembers = await fetch(`${apiBaseNoSlash}/group_members`);
      if (!resMembers.ok) throw new Error(`Group members HTTP ${resMembers.status}`);
      const membersArr = await resMembers.json();
      const members = membersArr.filter(m => Number(m.group_id) === Number(group_id));
      const usernames = [];
      for (const mm of members) {
        try {
          const uid = Number(mm.user_id);
          const r = await fetch(`${apiBaseNoSlash}/user/${uid}`);
          if (!r.ok) {
            usernames.push({ member_id: mm.member_id, user_id: mm.user_id, username: `user-${uid}`, admin: !!mm.group_admin });
            continue;
          }
          const u = await r.json();
          usernames.push({ member_id: mm.member_id, user_id: mm.user_id, username: (u.username || u.email || `user-${uid}`), admin: !!mm.group_admin });
        } catch (e) {
          usernames.push({ member_id: mm.member_id, user_id: mm.user_id, username: `user-${mm.user_id}`, admin: !!mm.group_admin });
        }
      }
      setMemberUsernames(usernames);
      setModalGroupName(group_name || '');
    } catch (err) {
      console.error('Failed to load member usernames', err);
      setMemberUsernames([]);
    }
  }

  async function checkAdminStatus(group_id) {
    try {
      const stored = localStorage.getItem('user');
      if (!stored) { setIsCurrentUserAdmin(false); setCurrentUserId(null); return; }
      const parsed = JSON.parse(stored);
      const curUid = parsed && parsed.user_id ? Number(parsed.user_id) : null;
      setCurrentUserId(curUid);
      if (!curUid) { setIsCurrentUserAdmin(false); return; }
      const apiBase = API_BASE;
      const apiBaseNoSlash = apiBase.replace(/\/$/, '');
      const res = await fetch(`${apiBaseNoSlash}/group_members`);
      if (!res.ok) { setIsCurrentUserAdmin(false); return; }
      const rows = await res.json();
      const match = rows.find(r => Number(r.group_id) === Number(group_id) && Number(r.user_id) === Number(curUid));
      setIsCurrentUserAdmin(!!(match && match.group_admin));
    } catch (e) {
      console.error('checkAdminStatus failed', e);
      setIsCurrentUserAdmin(false);
    }
  }

  async function handleDeleteGroupMovie(group_movie_id) {
    if (!group_movie_id) return;
    if (!window.confirm('Poistetaanko tämä elokuva ryhmästä?')) return;
    try {
      const apiBase = API_BASE;
      const apiBaseNoSlash = apiBase.replace(/\/$/, '');
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${apiBaseNoSlash}/group_movies/${group_movie_id}`, { method: 'DELETE', headers });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'delete failed');
      }
      // remove from UI
      setSelectedGroup(prev => ({ ...prev, movies: (prev.movies || []).filter(x => Number(x.group_movie_id) !== Number(group_movie_id)) }));
      setGroups(prev => prev.map(g => Number(g.group_id) === Number(selectedGroup.group_id) ? ({ ...g, movies: (g.movies||[]).filter(x => Number(x.group_movie_id) !== Number(group_movie_id)) }) : g));
    } catch (e) {
      console.error('Failed to delete group movie', e);
      window.alert('Poisto epäonnistui: ' + (e.message || 'virhe'));
    }
  }

  // fetch genres for add modal
  useEffect(() => {
    const apiBase = API_BASE;
    const apiBaseNoSlash = apiBase.replace(/\/$/, '');
    async function fetchGenres() {
      try {
        const r = await fetch(`${apiBaseNoSlash}/genres`);
        if (!r.ok) return;
        const data = await r.json();
        setGenresList(Array.isArray(data) ? data : []);
      } catch (e) {
        // ignore
      }
    }
    fetchGenres();
  }, []);

  // When groups loaded or hash changes, open group from gid param if present
  useEffect(() => {
    function getGid() {
      const m = (window.location.hash || '').match(/^#groups\?gid=(\d+)/);
      return m ? Number(m[1]) : null;
    }
    function syncFromHash() {
      const gid = getGid();
      if (!gid) {
        // if no gid and currently in detail, close
        if (selectedGroup) closeGroup();
        return;
      }
      // if already showing same group, nothing
      if (selectedGroup && Number(selectedGroup.group_id) === Number(gid)) return;
      const found = groups.find(g => Number(g.group_id) === Number(gid));
      if (found) openGroup(found);
    }
    // initial sync once groups available
    if (groups && groups.length >= 0) {
      syncFromHash();
    }
    const onHash = () => syncFromHash();
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [groups, selectedGroup]);

  function onSearchAddResults(payload) {
    const results = Array.isArray(payload.results) ? payload.results : [];
    setSearchAddResults(results.slice(0, 20));
  }

  function addMovieToGroup(movie) {
    if (!selectedGroup) return;
    const id = movie.tmdb_id || movie.movie_id || movie.id || movie.tmdbId;
    const exists = (selectedGroup.movies || []).some(m => (m.tmdb_id || m.movie_id) === id);
    if (exists) return;
    // Persist via the same confirm flow so backend receives added_by info
    try {
      confirmAddMovie(movie);
    } catch (e) {
      // fallback to client-only add if confirmAddMovie fails synchronously
      const newMovie = { tmdb_id: id, movie_title: movie.movie_title || movie.title || movie.name, movie_image: movie.movie_image || movie.poster_path };
      setSelectedGroup(prev => ({ ...prev, movies: [newMovie, ...(prev.movies || [])] }));
    }
  }

  // Perform search inside add modal
  async function performAddSearch() {
    setAddLoading(true);
    try {
      const apiBase = API_BASE;
      const apiBaseNoSlash = apiBase.replace(/\/$/, '');
      const params = new URLSearchParams();
      if (addSearchTerm) params.append('q', addSearchTerm);
      if (addSelectedGenres.length > 0) params.append('genres', addSelectedGenres.join(','));
      if (addCertification) params.append('certification', addCertification);
      const res = await fetch(`${apiBaseNoSlash}/tmdb/search?${params.toString()}`);
      const data = await res.json();
      const mapped = Array.isArray(data.results) ? data.results : [];
      setAddResults(mapped);
    } catch (e) {
      console.error('Add search failed', e);
      setAddResults([]);
    } finally {
      setAddLoading(false);
    }
  }

  function clearAddModal() {
    setShowAddModal(false);
    setAddSearchTerm('');
    setAddSelectedGenres([]);
    setAddCertification('');
    setAddResults([]);
    setSelectedAddMovie(null);
    setAddReason('');
  }

  function confirmAddMovie(movie) {
    // Persist to backend then add to UI
    (async () => {
      const apiBase = API_BASE;
      const apiBaseNoSlash = apiBase.replace(/\/$/, '');
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      // Attach current user info so backend can persist adder info
      let parsedUser = null;
      try { parsedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null; } catch (e) { parsedUser = null; }
      const currentUserId = parsedUser && parsedUser.user_id ? Number(parsedUser.user_id) : null;
      const currentUsername = parsedUser && (parsedUser.username || parsedUser.email) ? (parsedUser.username || parsedUser.email) : null;

      const payload = {
        group_id: Number(selectedGroup.group_id),
        tmdb_id: movie.id || movie.tmdb_id || movie.movie_id,
        movie_title: movie.title || movie.name || movie.movie_title,
        movie_image: movie.poster_path || movie.movie_image,
        movie_description: movie.overview || movie.movie_description || '',
        added_reason: addReason || '',
        added_by: currentUserId,
        added_by_username: currentUsername,
        added_by_is_member: currentUserId ? true : false
      };
      try {
        const res = await fetch(`${apiBaseNoSlash}/group_movies`, { method: 'POST', headers, body: JSON.stringify(payload) });
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          throw new Error(`HTTP ${res.status}: ${txt}`);
        }
        const created = await res.json();
        // Ensure created has adder info for immediate UI
        if (currentUserId && !created.added_by) created.added_by = currentUserId;
        if (currentUsername && !created.added_by_username) created.added_by_username = currentUsername;
        if (currentUserId && !created.added_by_is_member) created.added_by_is_member = true;
        // update selectedGroup and groups
        setSelectedGroup(prev => ({ ...prev, movies: [created, ...(prev.movies || [])] }));
        setGroups(prev => prev.map(g => Number(g.group_id) === Number(selectedGroup.group_id) ? { ...g, movies: [created, ...(g.movies || [])] } : g));
        // refresh persisted list to ensure server-side state
        try { fetchGroupMovies(selectedGroup.group_id); } catch (e) {}
      } catch (e) {
        console.error('Failed to persist group movie', e);
        // fallback to client-side add
        const fallback = {
          tmdb_id: movie.id || movie.tmdb_id || movie.movie_id,
          movie_title: movie.title || movie.name || movie.movie_title,
          movie_image: movie.poster_path || movie.movie_image,
          movie_description: movie.overview || movie.movie_description || '' ,
          added_reason: addReason || '',
          added_by: currentUserId,
          added_by_username: currentUsername,
          added_by_is_member: currentUserId ? true : false
        };
        setSelectedGroup(prev => ({ ...prev, movies: [fallback, ...(prev.movies || [])] }));
        setGroups(prev => prev.map(g => Number(g.group_id) === Number(selectedGroup.group_id) ? { ...g, movies: [fallback, ...(g.movies || [])] } : g));
        // surface error to user for easier debugging
        try { window.alert('Elokuvan tallennus epäonnistui: ' + (e.message || String(e))); } catch (ee) {}
      } finally {
        clearAddModal();
      }
    })();
  }

  async function fetchGroupMovies(group_id) {
    try {
      const apiBase = API_BASE;
      const apiBaseNoSlash = apiBase.replace(/\/$/, '');
      const res = await fetch(`${apiBaseNoSlash}/group_movies?group_id=${group_id}`);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const rows = await res.json();
      setSelectedGroup(prev => ({ ...prev, movies: Array.isArray(rows) ? rows : [] }));
    } catch (e) {
      console.error('Failed to load group movies', e);
    }
  }

  // --- Group Chat ---
  async function fetchGroupChatMessages(group_id) {
    try {
      const apiBase = API_BASE;
      const apiBaseNoSlash = apiBase.replace(/\/$/, '');
      const res = await fetch(`${apiBaseNoSlash}/group_messages`);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const rows = await res.json();
      const list = Array.isArray(rows) ? rows.filter(r => Number(r.group_id) === Number(group_id)) : [];
      // sort by created_at if present, else message_id
      list.sort((a,b) => {
        const ta = a.created_at ? new Date(a.created_at).getTime() : (a.message_id || 0);
        const tb = b.created_at ? new Date(b.created_at).getTime() : (b.message_id || 0);
        return ta - tb;
      });
      setChatMessages(list);
    } catch (e) {
      // fail silently; chat not critical
    }
  }

  useEffect(() => {
    if (!selectedGroup) return;
    fetchGroupChatMessages(selectedGroup.group_id);
    const id = setInterval(() => fetchGroupChatMessages(selectedGroup.group_id), 5000);
    return () => clearInterval(id);
  }, [selectedGroup?.group_id]);

  // Auto-scroll chat to bottom when messages change
  useEffect(() => {
    const el = chatListRef.current;
    if (!el) return;
    try {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    } catch {
      el.scrollTop = el.scrollHeight;
    }
  }, [chatMessages.length, selectedGroup?.group_id]);

  // Resolve user info for messages missing from cache
  useEffect(() => {
    const apiBase = API_BASE;
    const apiBaseNoSlash = apiBase.replace(/\/$/, '');
    const missing = [];
    for (const m of chatMessages) {
      const uid = Number(m.user_id);
      if (!uid) continue;
      if (!userCache[uid]) missing.push(uid);
    }
    if (missing.length === 0) return;
    const uniq = Array.from(new Set(missing)).slice(0, 10); // cap batch
    (async () => {
      const entries = await Promise.all(uniq.map(async uid => {
        try {
          const r = await fetch(`${apiBaseNoSlash}/user/${uid}`);
          if (!r.ok) throw new Error('HTTP ' + r.status);
          const u = await r.json();
          return [uid, { username: u.username || u.email || `user-${uid}`, avatar_url: u.avatar_url || u.profile_picture || '' }];
        } catch {
          return [uid, { username: `user-${uid}`, avatar_url: '' }];
        }
      }));
      setUserCache(prev => ({ ...prev, ...Object.fromEntries(entries) }));
    })();
  }, [chatMessages]);

  async function sendChatMessage() {
    const text = chatText.trim();
    if (!text) return;
    const stored = localStorage.getItem('user');
    let parsed;
    try { parsed = stored ? JSON.parse(stored) : null; } catch { parsed = null; }
    const uid = parsed && parsed.user_id ? Number(parsed.user_id) : null;
    if (!uid) {
      window.alert('Kirjaudu sisään kommentoidaksesi.');
      return;
    }
    try {
      const apiBase = API_BASE;
      const apiBaseNoSlash = apiBase.replace(/\/$/, '');
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const payload = { group_id: Number(selectedGroup.group_id), user_id: uid, message: text };
      // optimistic UI
      const optimistic = { message_id: `temp-${Date.now()}`, ...payload, created_at: new Date().toISOString() };
      setChatMessages(prev => [...prev, optimistic]);
      setChatText('');
      const res = await fetch(`${apiBaseNoSlash}/group_messages`, { method: 'POST', headers, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      // refresh to get real IDs
      fetchGroupChatMessages(selectedGroup.group_id);
    } catch (e) {
      // rollback optimistic add on failure
      setChatMessages(prev => prev.filter(m => !String(m.message_id).startsWith('temp-')));
      window.alert('Viestin lähetys epäonnistui.');
    }
  }

  // Update carousel scroll button states
  function updateScrollButtons() {
    const el = carouselRef.current;
    if (!el) { setCanScrollLeft(false); setCanScrollRight(false); return; }
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  }

  useEffect(() => {
    updateScrollButtons();
  }, [selectedGroup?.movies?.length]);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const onScroll = () => updateScrollButtons();
    el.addEventListener('scroll', onScroll, { passive: true });
    const onResize = () => updateScrollButtons();
    window.addEventListener('resize', onResize);
    updateScrollButtons();
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [carouselRef.current]);

  function scrollByAmount(dir = 1) {
    const el = carouselRef.current;
    if (!el) return;
    const amount = Math.max(200, Math.floor(el.clientWidth * 0.9));
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  }

  

  return (
    <div className="group-page">

      {loading ? (
        <div className="group-page-empty">Ladataan ryhmiä…</div>
      ) : error ? (
        <div className="group-page-empty">Virhe: {error}</div>
      ) : groups.length === 0 ? (
        <div className="group-page-empty">Ei ryhmiä.</div>
      ) : selectedGroup ? (
        // Group detail view
        <div className="group-detail">
          {/* top row: title left, back button right */}
          <div className="group-detail-top">
            <h2 className="group-title-row">{selectedGroup.group_name}</h2>
            <button className="back-btn" onClick={closeGroup} aria-label="Takaisin">Takaisin</button>
          </div>

          {/* description row */}
          <div className="group-desc-row">
            <p className="group-desc">{selectedGroup.group_description}</p>
          </div>

          {/* members row: count left, browse button right */}
          <div className="group-members-row">
            <div className="members-count">Jäseniä: {selectedGroup.member_count ?? 0}</div>
            <button className="small-btn" onClick={() => { setShowMembersList(true); loadMemberUsernames(selectedGroup.group_id, selectedGroup.group_name); }}>Selaa Jäseniä</button>
          </div>

          {showAddSearch && (
            <div className="add-search">
              <SearchBar onSearchResults={onSearchAddResults} />
            </div>
          )}

          {/* Members modal overlay (used from detail) */}
          {showMembersList && (
            <div className="members-modal-overlay" onClick={() => { setShowMembersList(false); setAddMemberUsername(''); }}>
              <div className="members-modal" onClick={e => e.stopPropagation()} role="dialog">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <h4>Jäsenet — {modalGroupName}</h4>
                  <button className="small-btn" onClick={() => { setShowMembersList(false); setAddMemberUsername(''); }}>Sulje</button>
                </div>
                <div className="members-lines">
                        {memberUsernames.length === 0 ? (
                          <div style={{padding:'0.5rem 0', color:'#6b7280'}}>Ei jäseniä.</div>
                        ) : (
                          memberUsernames.map((u, i) => (
                            <div className="member-line" key={i} style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                              <div>
                                {u.admin ? <strong>{u.username}</strong> : <span>{u.username}</span>}
                              </div>
                              <div>
                                {isCurrentUserAdmin && Number(u.user_id) !== Number(currentUserId) && (
                                  <button className="small-btn" onClick={async () => {
                                    if (!u.member_id) return;
                                    if (!window.confirm('Poistetaanko jäsen?')) return;
                                    try {
                                      const apiBase = API_BASE;
                                      const apiBaseNoSlash = apiBase.replace(/\/$/, '');
                                      const token = localStorage.getItem('token');
                                      const headers = {};
                                      if (token) headers['Authorization'] = `Bearer ${token}`;
                                      const res = await fetch(`${apiBaseNoSlash}/group_members/${u.member_id}`, { method: 'DELETE', headers });
                                      if (!res.ok) throw new Error('HTTP ' + res.status);
                                      // reload members
                                      loadMemberUsernames(selectedGroup.group_id, selectedGroup.group_name);
                                      // decrement count
                                      setSelectedGroup(prev => ({ ...prev, member_count: Math.max(0, (prev.member_count||0) - 1) }));
                                      setGroups(prev => prev.map(g => Number(g.group_id) === Number(selectedGroup.group_id) ? ({ ...g, member_count: Math.max(0, (g.member_count||0) - 1) }) : g));
                                    } catch (err) {
                                      console.error('Remove member failed', err);
                                      window.alert('Poisto epäonnistui');
                                    }
                                  }}>Poista</button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                </div>
                {isCurrentUserAdmin && (
                  <div style={{marginTop:'0.5rem', display:'flex', gap:'0.5rem'}}>
                    <input type="text" placeholder="Lisää käyttäjällä (käyttäjätunnus)" value={addMemberUsername} onChange={e => setAddMemberUsername(e.target.value)} style={{padding:'0.4rem', borderRadius:6, border:'1px solid #e5e7eb'}} />
                    <button className="small-btn" onClick={async () => {
                      const username = addMemberUsername && addMemberUsername.trim();
                      if (!username) return window.alert('Kirjoita käyttäjätunnus');
                      try {
                        const apiBase = API_BASE;
                        const apiBaseNoSlash = apiBase.replace(/\/$/, '');
                        const token = localStorage.getItem('token');
                        const headers = { 'Content-Type': 'application/json' };
                        if (token) headers['Authorization'] = `Bearer ${token}`;
                        const body = { username, group_id: Number(selectedGroup.group_id), group_admin: false };
                        const res = await fetch(`${apiBaseNoSlash}/group_members`, { method: 'POST', headers, body: JSON.stringify(body) });
                        if (!res.ok) {
                          const txt = await res.text();
                          throw new Error(txt || 'add failed');
                        }
                        // refresh members
                        loadMemberUsernames(selectedGroup.group_id, selectedGroup.group_name);
                        // increment count
                        setSelectedGroup(prev => ({ ...prev, member_count: (prev.member_count||0) + 1 }));
                        setGroups(prev => prev.map(g => Number(g.group_id) === Number(selectedGroup.group_id) ? ({ ...g, member_count: (g.member_count||0) + 1 }) : g));
                        setAddMemberUsername('');
                      } catch (err) {
                        console.error('Add member failed', err);
                        window.alert('Lisäys epäonnistui: ' + (err.message || 'virhe'));
                      }
                    }}>Lisää</button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="group-movies-header">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <strong>Elokuva Lista</strong>
              {selectedGroup && !selectedGroup.joined ? (
                <div style={{display:'flex', alignItems:'center', gap: '0.5rem'}}>
                  <button className="create-btn" disabled title="Et ole ryhmän jäsen, et voi lisätä elokuvia">Lisää elokuva</button>
                  <div style={{color:'#6b7280', fontSize:'0.9rem'}}>Vain ryhmän jäsenet voivat lisätä elokuvia.</div>
                </div>
              ) : (
                <button className="create-btn" onClick={() => setShowAddModal(true)}>Lisää elokuva</button>
              )}
            </div>
          </div>
          <div className="group-movies-list">
            {viewingMovieId ? (
              <div>
                <div style={{display:'flex', justifyContent:'flex-end'}}>
                  <button className="small-btn" onClick={() => setViewingMovieId(null)}>◀ Takaisin elokuvalistaan</button>
                </div>
                <div className="movie-detail-inline">
                  <MovieDetail movieId={viewingMovieId} />
                </div>
              </div>
            ) : (selectedGroup.movies && selectedGroup.movies.length > 0 ? (
              <div className="group-movies-carousel">
                {canScrollLeft && (
                  <button
                    className="carousel-btn left"
                    onClick={(e) => { e.stopPropagation(); scrollByAmount(-1); }}
                    aria-label="Edellinen"
                  >
                    ‹
                  </button>
                )}
                <div className="group-movies-viewport" ref={carouselRef}>
                  <div className="group-movies-track">
                  {selectedGroup.movies.map((m, i) => {
                  const title = m.movie_title || m.title || m.name || '—';
                  const desc = m.movie_description || m.overview || '';
                  let img = m.movie_image || m.poster_path || '';
                  if (img && img.startsWith('/')) img = `https://image.tmdb.org/t/p/w300${img}`;
                  const movieId = m.tmdb_id || m.id || m.movie_id;
                  const isAdderAdmin = !!m.added_by_is_admin;
                  const isAdderMember = !!m.added_by_is_member;
                  const adder = isAdderMember ? (m.added_by_username || (m.added_by ? `user-${m.added_by}` : 'Tuntematon')) : 'poistunut henkilö';
                  const createdAt = m.created_at || m.createdAt || null;
                  let createdAtText = null;
                  try { if (createdAt) createdAtText = new Date(createdAt).toLocaleString(); } catch (e) { createdAtText = String(createdAt); }
                  const canRemove = ((isCurrentUserAdmin || (currentUserId && m.added_by && Number(m.added_by) === Number(currentUserId))) && m.group_movie_id);
                  return (
                    <div
                      key={i}
                      className={`group-movie-card ${isAdderAdmin ? 'admin' : ''}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        if (!movieId) return;
                        try {
                          if (selectedGroup && selectedGroup.group_id) {
                            sessionStorage.setItem('returnToGroup', String(selectedGroup.group_id));
                            sessionStorage.setItem('returnTo', `#groups?gid=${selectedGroup.group_id}`);
                          }
                        } catch (e) {}
                        window.location.hash = `#movie/${movieId}`;
                      }}
                      onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && movieId) {
                        try { if (selectedGroup && selectedGroup.group_id) { sessionStorage.setItem('returnToGroup', String(selectedGroup.group_id)); sessionStorage.setItem('returnTo', `#groups?gid=${selectedGroup.group_id}`); } } catch (ee) {}
                        window.location.hash = `#movie/${movieId}`;
                      }}}
                    >
                      {img ? (
                        <img src={img} alt={title} onError={e => e.target.style.display = 'none'} />
                      ) : (
                        <div className="no-poster">Ei kuvaa</div>
                      )}
                      <div className="group-movie-popover" onClick={e => e.stopPropagation()}>
                        <div className="popover-title">{title}</div>
                        {desc && <div className="popover-desc">{desc.length > 220 ? `${desc.slice(0,220)}…` : desc}</div>}
                        <div className="popover-meta">Lisäsi: {isAdderAdmin ? <strong>{adder}</strong> : <span>{adder}</span>}</div>
                        {createdAtText && <div className="popover-meta">Lisätty: <span className="dim">{createdAtText}</span></div>}
                        {m.added_reason && <div className="popover-meta">Syy: {m.added_reason}</div>}
                        {canRemove && (
                          <div className="popover-actions">
                            <button
                              className="movie-delete-btn"
                              onClick={e => { e.stopPropagation(); handleDeleteGroupMovie(m.group_movie_id); }}
                            >Poista</button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                  </div>
                </div>
                {canScrollRight && (
                  <button
                    className="carousel-btn right"
                    onClick={(e) => { e.stopPropagation(); scrollByAmount(1); }}
                    aria-label="Seuraava"
                  >
                    ›
                  </button>
                )}
              </div>
            ) : (
              <div className="group-page-empty">Ei elokuvia listalla.</div>
            ))}
          </div>

          {/* Group Chat */}
          <div className="group-chat">
            <div className="group-chat-header"><strong>Keskustelu</strong></div>
            <div className="chat-messages" ref={chatListRef}>
              {chatMessages.length === 0 ? (
                <div className="chat-empty">Ei viestejä vielä.</div>
              ) : (
                chatMessages.map((msg) => {
                  const uid = Number(msg.user_id);
                  const userInfo = userCache[uid] || {};
                  const name = userInfo.username || `user-${uid || '—'}`;
                  const avatar = userInfo.avatar_url || '';
                  let createdAtText = '';
                  const ts = msg.created_at || msg.createdAt || null;
                  try { if (ts) createdAtText = new Date(ts).toLocaleString(); } catch {}
                  return (
                    <div key={msg.message_id} className="chat-message">
                      <div className="chat-avatar">
                        {avatar ? (
                          <img src={avatar} alt={name} onError={e => e.target.style.display='none'} />
                        ) : (
                          <div className="avatar-fallback">{String(name).slice(0,1).toUpperCase()}</div>
                        )}
                      </div>
                      <div className="chat-bubble">
                        <div className="chat-meta">
                          <span className="chat-name">{name}</span>
                          {createdAtText && <span className="chat-time">{createdAtText}</span>}
                        </div>
                        <div className="chat-text">{msg.message}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="chat-input-row">
              <textarea
                className="chat-input"
                rows={2}
                placeholder="Kirjoita viesti. Enter lähettää, Shift+Enter rivinvaihto"
                value={chatText}
                onChange={e => setChatText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey && !(e.nativeEvent && e.nativeEvent.isComposing)) {
                    e.preventDefault();
                    sendChatMessage();
                  }
                }}
              />
              <button className="small-btn" onClick={sendChatMessage}>Lähetä</button>
            </div>
          </div>

          {/* Add Movie Modal */}
          {showAddModal && (
            <div className="add-modal-overlay" onClick={() => clearAddModal()}>
              <div className="add-modal" onClick={e => e.stopPropagation()} role="dialog">
                {!selectedAddMovie ? (
                  <div>
                    <h3>Lisää elokuva ryhmään</h3>
                    <div className="add-row add-row-1">
                      <input type="text" className="add-search-input" placeholder="Hae elokuvan nimellä..." value={addSearchTerm} onChange={e => setAddSearchTerm(e.target.value)} />
                    </div>
                    <div className="add-row add-row-2">
                      <select className="add-select" multiple={false} value={addSelectedGenres.join(',')} onChange={e => setAddSelectedGenres(e.target.value ? e.target.value.split(',') : [])}>
                        <option value="">Valitse genre (ei pakollinen)</option>
                        {genresList.map(g => (<option key={g.genre_id} value={g.genre_id}>{g.genre_name}</option>))}
                      </select>
                      <select className="add-select" value={addCertification} onChange={e => setAddCertification(e.target.value)}>
                        <option value="">Ikäraja (Kaikki)</option>
                        <option value="G">G</option>
                        <option value="PG">PG</option>
                        <option value="PG-13">PG-13</option>
                        <option value="R">R</option>
                        <option value="NC-17">NC-17</option>
                      </select>
                    </div>
                    <div className="add-row add-row-3">
                      <button className="create-btn" onClick={() => performAddSearch()} disabled={addLoading}>Hae</button>
                    </div>

                    <div className="add-results">
                      {addLoading ? <div>Haetaan…</div> : (
                        addResults.length === 0 ? <div style={{color:'#6b7280'}}>Ei tuloksia.</div> : (
                          <div className="movies-grid-inline">
                            {addResults.map(item => {
                              const key = item.id || item.tmdb_id || item.movie_id;
                              const poster = item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : (item.movie_image || '');
                              return (
                                <div className="movie-card add-result" key={key} onClick={() => setSelectedAddMovie(item)} style={{cursor:'pointer'}}>
                                  {poster ? (
                                    <img src={poster} alt={item.title || item.name} onError={(e)=>{e.target.style.display='none';}} style={{width:'100%'}} />
                                  ) : (
                                    <div className="no-poster" style={{height:240,display:'flex',alignItems:'center',justifyContent:'center',background:'#f3f4f6',color:'#6b7280'}}>Ei kuvaa</div>
                                  )}
                                  <div className="movie-info">
                                    <div className="movie-title">{item.title || item.name}</div>
                                    <div className="movie-desc">{item.overview ? item.overview.slice(0,120) + (item.overview.length>120?'...':'') : ''}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="selected-movie-detail">
                    <button className="small-btn" onClick={() => setSelectedAddMovie(null)}>◀ Takaisin hakutuloksiin</button>
                    <h3>{selectedAddMovie.title || selectedAddMovie.name}</h3>
                    <div style={{display:'flex', gap:'1rem'}}>
                      {selectedAddMovie.poster_path && <img src={`https://image.tmdb.org/t/p/w300${selectedAddMovie.poster_path}`} alt="poster" style={{width:180}} />}
                      <div style={{flex:1}}>
                        <p>{selectedAddMovie.overview}</p>
                        <label>Syy lisäämiseen</label>
                        <textarea value={addReason} onChange={e=>setAddReason(e.target.value)} className="modal-textarea" />
                        <div style={{display:'flex', justifyContent:'flex-end', marginTop:'0.5rem'}}>
                          <button className="create-submit" onClick={() => confirmAddMovie(selectedAddMovie)}>Lisää elokuva ryhmään</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Search results area at bottom */}
          {searchAddResults && searchAddResults.length > 0 && (
            <div className="add-search-results">
              <h4>Hakutulokset</h4>
              <div className="movies-grid-inline">
                {searchAddResults.map(item => (
                  <div className="movie-card small" key={item.movie_id || item.tmdb_id} onClick={() => addMovieToGroup(item)}>
                    <div className="movie-info">
                      <div className="movie-title">{item.movie_title || item.title || item.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="group-list">
          <div className="group-page-header">
            <h2>Selaa Ryhmiä</h2>
            <button className="create-btn" onClick={() => setShowCreate(true)}>Lisää Ryhmä</button>
          </div>
          {showCreate && (
            <div className="create-modal-overlay" onClick={() => setShowCreate(false)}>
              <div className="create-modal" onClick={e => e.stopPropagation()} role="dialog">
                <h3>Luo uusi ryhmä</h3>
                <label className="modal-label">Ryhmä nimi</label>
                <input className="modal-input" value={newName} onChange={e => setNewName(e.target.value)} />
                <label className="modal-label">Kuvaus</label>
                <textarea className="modal-input" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
                <div style={{display:'flex', justifyContent:'flex-end', marginTop:'0.5rem'}}>
                  <button className="create-submit" onClick={createGroup}>Luo Ryhmä</button>
                </div>
              </div>
            </div>
          )}
          {groups.map(g => (
            <div className="group-card" key={g.group_id} onClick={() => openGroup(g)}>
              <div className="group-card-header">
                <div className="group-name">{g.group_name || '—'}</div>
                <button
                  className={`join-btn ${g.joined ? 'joined' : ''}`}
                  aria-label={`Liity ryhmään ${g.group_name || ''}`}
                  onClick={(e) => { e.stopPropagation(); if (!g.joined) joinGroup(g.group_id); }}
                  disabled={!!g.joined}
                >
                  {g.joined ? 'Liittynyt' : 'Liity Ryhmään'}
                </button>
              </div>
              {g.group_description && <div className="group-desc">{g.group_description}</div>}
              <div className="group-meta">Jäseniä: {g.member_count ?? 0}</div>
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GroupPage;
