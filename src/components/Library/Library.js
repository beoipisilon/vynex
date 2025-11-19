import "../Dashboard/Dashboard.css";
import "../Dashboard/DashboardM.css";
import { useState, useEffect, Suspense, lazy } from 'react';
import Skeleton from '@mui/material/Skeleton';
const Videocard = lazy(() => import('../VideoCard/Videocard'));

const Library = () => {
  const [savedVideos, setSavedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  var maxResult = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

  useEffect(() => {
    const loadSavedVideos = () => {
      try {
        const saved = localStorage.getItem('library_videos');
        if (saved) {
          const videos = JSON.parse(saved);
          setSavedVideos(videos);
        }
      } catch (error) {
        console.error('Erro ao carregar vídeos salvos:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSavedVideos();
  }, []);

  const handleRemoveVideo = (videoId) => {
    const updated = savedVideos.filter(video => video.id !== videoId);
    setSavedVideos(updated);
    localStorage.setItem('library_videos', JSON.stringify(updated));
  };

  return (
    <div className='dashboard-main'>
      <h1>Library</h1>
      {savedVideos.length === 0 && !loading ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3em', 
          color: 'var(--text-light)',
          fontStyle: 'italic'
        }}>
          <p>Nenhum vídeo salvo ainda.</p>
          <p style={{ fontSize: '0.9em', marginTop: '0.5em' }}>
            Os vídeos que você salvar aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="dashboard-container">
          {!loading ? savedVideos.map((video) => {
            return (
              <Suspense 
                fallback={
                  <div className='skeleton-main'>
                    <Skeleton className="skeleton-thumb" variant="rectangular" sx={{ bgcolor: 'var(--secondary-alt)' }} />
                    <div className="skeleton-info">
                      <Skeleton className="skeleton-avatar" variant="circular" width={36} height={36} sx={{ bgcolor: 'var(--secondary-alt)' }} />
                      <div className="skeleton-text">
                        <Skeleton variant="text" width="90%" height={20} sx={{ bgcolor: 'var(--secondary-alt)' }} />
                        <Skeleton variant="text" width="60%" height={20} sx={{ bgcolor: 'var(--secondary-alt)' }} />
                      </div>
                    </div>
                  </div>
                } 
                key={video.id + Math.random()} 
              >
                <Videocard video={video} />
              </Suspense>
            )
          })
            : maxResult.map((obj) => {
              return (
                <div className='skeleton-main' key={obj}>
                  <Skeleton className="skeleton-thumb" variant="rectangular" sx={{ bgcolor: 'var(--secondary-alt)' }} />
                  <div className="skeleton-info">
                    <Skeleton className="skeleton-avatar" variant="circular" width={36} height={36} sx={{ bgcolor: 'var(--secondary-alt)' }} />
                    <div className="skeleton-text">
                      <Skeleton variant="text" width="90%" height={20} sx={{ bgcolor: 'var(--secondary-alt)' }} />
                      <Skeleton variant="text" width="60%" height={20} sx={{ bgcolor: 'var(--secondary-alt)' }} />
                    </div>
                  </div>
                </div>
              )
            })
          }
        </div>
      )}
    </div>
  )
}

export default Library

