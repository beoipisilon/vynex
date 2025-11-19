import "./Dashboard.css";
import "./DashboardM.css";
import { useState, useEffect, Suspense, lazy } from 'react';
import axios from 'axios';
import Skeleton from '@mui/material/Skeleton';
import { useApiRequest } from '../../hooks/useApiRequest';
const Videocard = lazy(() => import('../VideoCard/Videocard'));

const Dashboard = () => {
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { makeRequest, cancelRequest } = useApiRequest();
  var maxResult = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

  useEffect(() => {
    let isMounted = true;

    const fetchTrendingVideos = async () => {
      try {
        const TrendData = await makeRequest(
          '/api/youtube',
          {
            params: {
              endpoint: 'videos',
              part: 'snippet,contentDetails,statistics',
              chart: 'mostPopular',
              regionCode: 'US',
              maxResults: 20
            }
          },
          'dashboard-trending'
        );

        if (isMounted && TrendData && TrendData.data && TrendData.data.items) {
          setTrendingVideos(TrendData.data.items);
        }
      } catch (error) {
        if (isMounted && error.message !== 'Request cancelled') {
          console.error('Erro ao buscar vídeos trending:', error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    fetchTrendingVideos();

    return () => {
      isMounted = false;
      cancelRequest();
    };
  }, [makeRequest, cancelRequest]);

  return (
    <div className='dashboard-main'>
      <h1>Trending</h1>
      <div className="dashboard-container">
        {!loading ? trendingVideos.map((video) => {
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

export default Dashboard
