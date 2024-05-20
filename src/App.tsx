import axios from 'axios';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { User } from './types/user';
import { FaTrash, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

function App() {
  const [username, setUsername] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<'name' | 'language' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  async function makeRequest() {
    const response = await axios.post('http://localhost:3002/', { username });
    setUser(response.data);
    setSearchTerm(''); // Reset search term
    setSortKey(null); // Reset sort key
    setSortOrder('asc'); // Reset sort order
  }

  const socket = io('http://localhost:3002');

  useEffect(() => {
    socket.on('dataSaved', (newUser) => {
      setUser(newUser.user);
      console.log(newUser);
    });

    return () => {
      socket.off('dataSaved');
    };
  }, [socket]);

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3002/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete repository');
      }
      setUser((prevUser: User) => ({
        ...prevUser,
        repos: prevUser?.repos.filter(repo => repo.id !== id)
      }) as User);
    } catch (error) {
      console.error('Error deleting repository:', error.message);
    }
  };

  const handleSort = (key: 'name' | 'language') => {
    const newSortOrder = (sortKey === key && sortOrder === 'asc') ? 'desc' : 'asc';
    setSortKey(key);
    setSortOrder(newSortOrder);
  };

  const sortedRepos = user?.repos?.filter(repo => repo.name.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) => {
    if (!sortKey) return 0;
    const aValue = (a[sortKey] || '').toLowerCase();
    const bValue = (b[sortKey] || '').toLowerCase();
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  }) ?? [];

  const renderSortIcon = (key: 'name' | 'language') => {
    if (sortKey !== key) return <FaSort />;
    if (sortOrder === 'asc') return <FaSortUp />;
    return <FaSortDown />;
  };

  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-gray-100 py-2">
      <section className="p-8 bg-white rounded shadow-md w-full max-w-5xl">
        <header className="mb-4">
          <h1 className="text-2xl font-bold">Buscar usuário do GitHub</h1>
        </header>
        <div className="flex gap-2 mb-4">
          <label htmlFor="username" className="sr-only">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="border p-2 flex-grow"
          />
          <button onClick={makeRequest} className="bg-blue-500 text-white p-2">Buscar</button>
        </div>
        {user && (
          <article className="border-t pt-4">
            <div className="flex items-center gap-4 mb-4">
              <img src={user.avatar_url} alt={user.name} className="w-16 h-16 rounded-full" />
              <div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p><strong>Usuário:</strong> {user.login}</p>
                <p><strong>Localização:</strong> {user.location}</p>
                <a href={`https://github.com/${user.login}`} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                  Ver no GitHub
                </a>
              </div>
            </div>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Filtrar repositórios por nome"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="border p-2 w-full"
              />
            </div>

            <h3 className="text-lg font-bold mb-5">Repositórios:</h3>

            {sortedRepos.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer flex items-center gap-1"
                      onClick={() => handleSort('name')}
                    >
                      Nome {renderSortIcon('name')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      URL
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer flex items-center gap-1"
                      onClick={() => handleSort('language')}
                    >
                      Linguagem {renderSortIcon('language')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deletar
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedRepos.map((repo) => (
                    <tr key={repo.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{repo.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          Ir para o repositório
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{repo.language}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button onClick={() => handleDelete(repo.id)}>
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-gray-500 mt-4">Nenhum repositório encontrado.</p>
            )}
          </article>
        )}
      </section>
    </main>
  );
}

export default App;
