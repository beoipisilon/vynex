import "../Dashboard/Dashboard.css";
import "../Dashboard/DashboardM.css";
import { useState, useEffect, Suspense, lazy } from 'react';
import axios from 'axios';
import Skeleton from '@mui/material/Skeleton';
const Videocard = lazy(() => import('../VideoCard/Videocard'));

const Music = () => {
  const [musicVideos, setMusicVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  var maxResult = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

  useEffect(() => {
    const fetchMusicVideos = async () => {
      try {
        const MusicData = await axios.get('/', {
          params: {
            endpoint: 'search',
            part: 'snippet',
            q: 'music',
            type: 'video',
            maxResults: 20,
            order: 'viewCount'
          },
          headers: {
            'Cache-Control': 'max-age=2592000'
          }
        });

        if (MusicData && MusicData.data.items) {
          const videoIds = MusicData.data.items.map(item => item.id.videoId).join(',');
          
          const VideoDetails = await axios.get('/', {
            params: {
              endpoint: 'videos',
              part: 'snippet,contentDetails,statistics,player',
              id: videoIds
            },
            headers: {
              'Cache-Control': 'max-age=2592000'
            }
          });

          if (VideoDetails) {
            setMusicVideos(VideoDetails.data.items);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar vídeos de música:', error);
        setLoading(false);
      }
    }
    fetchMusicVideos();
  }, []);

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

