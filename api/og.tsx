import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default function handler(req: Request) {
  const { searchParams } = new URL(req.url);

  const home = searchParams.get('home') || 'Everton FC';
  const away = searchParams.get('away') || 'Manchester City FC';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          background: '#020617',
          color: 'white',
          fontFamily: 'sans-serif',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '900px',
            height: '470px',
            border: '2px solid #34d399',
            borderRadius: '32px',
            padding: '50px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: '#020817',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            <div
              style={{
                fontSize: 64,
                fontWeight: 700,
              }}
            >
              FootyAM
            </div>

            <div
              style={{
                border: '2px solid #34d399',
                color: '#34d399',
                padding: '10px 28px',
                borderRadius: '999px',
                fontSize: 30,
                fontWeight: 600,
              }}
            >
              BLIND MODE: ON
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '40px',
              fontSize: 52,
              fontWeight: 700,
            }}
          >
            <div>{home}</div>

            <div style={{ color: '#34d399' }}>VS</div>

            <div>{away}</div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                border: '2px solid #34d399',
                color: '#34d399',
                padding: '18px 34px',
                borderRadius: '999px',
                fontSize: 34,
                fontWeight: 600,
              }}
            >
              ▶ Watch Highlights
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}