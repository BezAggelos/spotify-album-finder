export default function Login({ onLogin }) {
  return (
    <button
      type="button"
      className='button-icon'
      onClick={onLogin}>
      Login with Spotify
    </button>
  );
}