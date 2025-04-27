import Link from 'next/link';
import { NextPageContext } from 'next';

interface ErrorProps {
  statusCode?: number;
}

function Error({ statusCode }: ErrorProps) {
  const message =
    statusCode === 404
      ? 'Page not found'
      : statusCode
        ? `An error ${statusCode} occurred on the server`
        : 'An error occurred on the client';

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1 style={{ fontSize: '2em', marginBottom: '20px' }}>{statusCode ? `Error ${statusCode}` : 'Error'}</h1>
      <p style={{ fontSize: '1.2em', color: '#555' }}>{message}</p>
      {statusCode === 404 && (
        <>
          <p style={{ marginTop: '20px' }}>
            Perhaps you were looking for:
          </p>
          <Link 
            href="/" 
            style={{ color: 'blue', textDecoration: 'none' }}
          >
            Go back to the homepage
          </Link>
        </>
      )}
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;