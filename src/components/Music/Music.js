import "../Dashboard/Dashboard.css";
import "../Dashboard/DashboardM.css";
import { useState, useEffect, Suspense, lazy } from 'react';
import axios from 'axios';
import Skeleton from '@mui/material/Skeleton';
import { useApiRequest } from '../../hooks/useApiRequest';
const Videocard = lazy(() => import('../VideoCard/Videocard'));

const Music = () => {
  const [musicVideos, setMusicVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { makeRequest, cancelRequest } = useApiRequest();
  var maxResult = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

  useEffect(() => {
    let isMounted = true;

    const fetchMusicVideos = async () => {
      try {
        const MusicData = await makeRequest(
          '/api/youtube',
          {
            params: {
              endpoint: 'videos',
              part: 'snippet,contentDetails,statistics',
              chart: 'mostPopular',
              regionCode: 'US',
              videoCategoryId: '10',
              maxResults: 20
            }
          },
          'music-videos'
        );

        if (isMounted && MusicData && MusicData.data && MusicData.data.items) {
          setMusicVideos(MusicData.data.items);
        }
      } catch (error) {
        if (isMounted && error.message !== 'Request cancelled') {
          console.error('Erro ao buscar vídeos de música:', error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    fetchMusicVideos();

    return () => {
      isMounted = false;
      cancelRequest();
    };
  }, [makeRequest, cancelRequest]);

  return (
    <div className='dashboard-main'>
      <h1>Music</h1>
      <div className="dashboard-container">
        {!loading ? musicVideos.map((video) => {
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
    </div>
  )
}

export default Music

