
import useFetch from "./useFetch";
import "./App.css";

export default function App() {
  const { data, loading, error, retry } = useFetch(
    "https://jsonplaceholder.typicode.com/users"
  );

  if (loading) {
    return (
      <div className="app">
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <h1>User List</h1>
        <p>Something went wrong: {error.message}</p>
        <button onClick={retry}>Retry</button>
      </div>
    );
  }

  return (
    <div className="app">
      <h1>User List</h1>
      <ul className="todo-list">
        {data.map((user) => (
          <li key={user.id}>
            <span>
              {user.name} <small>{user.email}</small>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}