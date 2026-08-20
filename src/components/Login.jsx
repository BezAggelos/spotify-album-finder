export default function Login({ onLogin }) {
  return (
    <button
      type="button"
      className='login-button'
      onClick={onLogin}>
      Login with Spotify
    </button>
  );
}