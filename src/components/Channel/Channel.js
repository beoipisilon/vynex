import "../Dashboard/Dashboard.css";
import "../Dashboard/DashboardM.css";
import "./Channel.css";
import { useState, useEffect, Suspense, lazy } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Skeleton from '@mui/material/Skeleton';
import { HiDotsVertical } from 'react-icons/hi';
import { FaTimes } from 'react-icons/fa';
const Videocard = lazy(() => import('../VideoCard/Videocard'));

const Channel = () => {
  const { channelId } = useParams();
  const [channelData, setChannelData] = useState(null);
  const [channelVideos, setChannelVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  var maxResult = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        const ChannelInfo = await axios.get('/api/youtube', {
          params: {
            endpoint: 'channels',
            part: 'snippet,statistics,brandingSettings,contentDetails',
            id: channelId
          },
          headers: {
            'Cache-Control': 'max-age=2592000'
          }
        });

        if (ChannelInfo && ChannelInfo.data.items && ChannelInfo.data.items[0]) {
            setChannelData(ChannelInfo.data.items[0]);
            setLoading(false);
            setError(null);
        } else {
            setError('Canal não encontrado');
            setLoading(false);
        }
      } catch (error) {
        console.error('Erro ao buscar informações do canal:', error);
        if (error.response?.status === 403) {
          setError('Erro de acesso à API (403). Verifique se a API key está configurada corretamente ou se há um proxy configurado.');
        } else if (error.response?.status === 404) {
          setError('Canal não encontrado');
        } else {
          setError('Erro ao carregar informações do canal. Tente novamente mais tarde.');
        }
        setLoading(false);
      }
    };

    const fetchChannelVideos = async () => {
      try {
        const VideosData = await axios.get('/api/youtube', {
          params: {
            endpoint: 'search',
            part: 'snippet',
            channelId: channelId,
            type: 'video',
            order: 'date',
            maxResults: 20
          },
          headers: {
            'Cache-Control': 'max-age=2592000'
          }
        });

        if (VideosData && VideosData.data.items) {
          const videoIds = VideosData.data.items.map(item => item.id.videoId).join(',');
          
          if (videoIds) {
            const VideoDetails = await axios.get('/api/youtube', {
              params: {
                endpoint: 'videos',
                part: 'snippet,contentDetails,statistics,player',
                id: videoIds
              },
              headers: {
                'Cache-Control': 'max-age=2592000'
              }
            });

            if (VideoDetails && VideoDetails.data.items) {
              setChannelVideos(VideoDetails.data.items);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao buscar vídeos do canal:', error);
      } finally {
        setLoadingVideos(false);
      }
    };

    if (channelId) {
      fetchChannelData();
      fetchChannelVideos();
    }
  }, [channelId]);

  if (loading) {
    return (
      <div className='dashboard-main'>
        <div style={{ padding: '2em' }}>
          <Skeleton variant="rectangular" width="100%" height={200} sx={{ bgcolor: 'var(--secondary-alt)', marginBottom: '1em' }} />
          <Skeleton variant="text" width="60%" height={40} sx={{ bgcolor: 'var(--secondary-alt)' }} />
          <Skeleton variant="text" width="40%" height={30} sx={{ bgcolor: 'var(--secondary-alt)' }} />
        </div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className='dashboard-main'>
        <div style={{ textAlign: 'center', padding: '3em', color: 'var(--text-light)' }}>
          <p style={{ marginBottom: '1em', fontSize: '1.1em' }}>{error}</p>
          {error.includes('403') && (
            <div style={{ marginTop: '1em', padding: '1em', backgroundColor: 'var(--secondary-alt)', borderRadius: '0.5em', maxWidth: '600px', margin: '1em auto' }}>
              <p style={{ fontSize: '0.9em', marginBottom: '0.5em' }}>Possíveis soluções:</p>
              <ul style={{ textAlign: 'left', fontSize: '0.85em', paddingLeft: '1.5em' }}>
                <li>Configure a variável de ambiente REACT_APP_YT_URL com um proxy/backend</li>
                <li>Verifique se a API key está correta no arquivo .env</li>
                <li>Certifique-se de que não há restrições de CORS bloqueando as requisições</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!channelData && !error) {
    return (
      <div className='dashboard-main'>
        <div style={{ textAlign: 'center', padding: '3em', color: 'var(--text-light)' }}>
          <p>Carregando informações do canal...</p>
        </div>
      </div>
    );
  }

  const { snippet, statistics, brandingSettings } = channelData;
  const subscribers = Intl.NumberFormat('en', { notation: "compact" }).format(statistics?.subscriberCount || 0);
  const videoCount = Intl.NumberFormat('en', { notation: "compact" }).format(statistics?.videoCount || 0);
  const totalViews = Intl.NumberFormat('en', { notation: "compact" }).format(statistics?.viewCount || 0);

  const bannerUrl = brandingSettings?.image?.bannerExternalUrl || 
                    brandingSettings?.image?.bannerTabletHdImageUrl || 
                    brandingSettings?.image?.bannerTabletImageUrl || 
                    brandingSettings?.image?.bannerMobileImageUrl || 
                    '';

  return (
    <div className='dashboard-main'>
      <div className="channel-header">
        <div className="channel-banner">
          {bannerUrl ? (
            <img 
              src={bannerUrl} 
              alt={snippet?.title}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--secondary-alt)' }}></div>
          )}
        </div>
        <div className="channel-info-header">
          <div className="channel-avatar-large">
            <img
              src={snippet?.thumbnails?.high?.url || snippet?.thumbnails?.default?.url}
              alt={snippet?.title}
            />
          </div>
          <div className="channel-info-text">
            <div className="channel-title-row">
              <h2>{snippet?.title}</h2>
              <button 
                className="channel-more-btn"
                onClick={() => setShowModal(true)}
                title="Mais informações"
              >
                <HiDotsVertical size={24} />
              </button>
            </div>
            <div className="channel-stats">
              <span>{subscribers} subscribers</span>
              <span className="separator">•</span>
              <span>{videoCount} videos</span>
              <span className="separator">•</span>
              <span>{totalViews} total views</span>
            </div>
            {snippet?.description && (
              <p className="channel-description">
                {snippet.description.length > 300 
                  ? `${snippet.description.substring(0, 300)}...` 
                  : snippet.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="channel-videos-section">
        <h3 className="channel-videos-title">Videos</h3>
        <div className="dashboard-container">
        {!loadingVideos ? channelVideos.map((video) => {
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

      {showModal && (
        <div className="channel-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="channel-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="channel-modal-header">
              <h3>{snippet?.title}</h3>
              <button 
                className="channel-modal-close"
                onClick={() => setShowModal(false)}
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="channel-modal-body">
              {snippet?.description && (
                <div className="channel-modal-section">
                  <h4>Descrição</h4>
                  <p className="channel-modal-description">{snippet.description}</p>
                </div>
              )}
              <div className="channel-modal-section">
                <h4>Estatísticas</h4>
                <div className="channel-modal-stats">
                  <p><strong>{subscribers}</strong> subscribers</p>
                  <p><strong>{videoCount}</strong> videos</p>
                  <p><strong>{totalViews}</strong> total views</p>
                </div>
              </div>
              {snippet?.customUrl && (
                <div className="channel-modal-section">
                  <h4>Links</h4>
                  <a 
                    href={`https://youtube.com/${snippet.customUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="channel-modal-link"
                  >
                    youtube.com/{snippet.customUrl}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Channel

