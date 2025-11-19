import "./Player.css";
import { useState, useEffect, Suspense, lazy, useRef } from 'react'
import axios from 'axios'
import { useLocation, useParams } from 'react-router-dom'
import ReactPlayer from 'react-player/youtube'
import { FaBell, FaRegBell, FaThumbsUp, FaThumbsDown, FaRegThumbsUp, FaRegThumbsDown, FaBookmark, FaRegBookmark } from 'react-icons/fa'
import { AiOutlineUser } from 'react-icons/ai'
const Videocard = lazy(() => import('../VideoCard/Videocard'));

const Player = () => {
    const [like, setLike] = useState(null);
    const [subbed, setSubbed] = useState(false);
    const [notify, setNotify] = useState(false);
    const [saved, setSaved] = useState(false);
    const [relatedVideos, setRelatedVideos] = useState([]);
    const [loadingRelated, setLoadingRelated] = useState(true);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [userName, setUserName] = useState('Usuário');
    const commentInputRef = useRef(null);

    //Alt Like and Dislike Btns
    const ToggleLike = () => {
        if (like === true) {
            setLike(null);
        } else setLike(prev => prev === true ? false : true);
    }

    const ToggleDislike = () => {
        if (like === false) {
            setLike(null);
        } else setLike(prev => prev === false ? true : false);
    }

    const location = useLocation();
    const { videoId } = useParams();
    const { Title, channelData, video } = location.state;

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const subscribers = Intl.NumberFormat('en', { notation: "compact" }).format(channelData?.statistics?.subscriberCount);
    const likes = Intl.NumberFormat('en', { notation: "compact" }).format(video.statistics.likeCount);

    useEffect(() => {
        const savedComments = localStorage.getItem(`comments_${videoId}`);
        if (savedComments) {
            setComments(JSON.parse(savedComments));
        }

        const savedUserName = localStorage.getItem('userName');
        if (savedUserName) {
            setUserName(savedUserName);
        }

        const libraryVideos = localStorage.getItem('library_videos');
        if (libraryVideos) {
            const videos = JSON.parse(libraryVideos);
            const isSaved = videos.some(v => v.id === videoId);
            setSaved(isSaved);
        }
    }, [videoId]);

    const handleAddComment = (e) => {
        e.preventDefault();
        if (commentText.trim() === '') return;

        const newComment = {
            id: Date.now(),
            text: commentText.trim(),
            author: userName,
            timestamp: new Date().toISOString(),
            likes: 0
        };

        const updatedComments = [newComment, ...comments];
        setComments(updatedComments);
        localStorage.setItem(`comments_${videoId}`, JSON.stringify(updatedComments));
        setCommentText('');
    };

    const handleLikeComment = (commentId) => {
        const updatedComments = comments.map(comment => {
            if (comment.id === commentId) {
                return { ...comment, likes: comment.likes + 1 };
            }
            return comment;
        });
        setComments(updatedComments);
        localStorage.setItem(`comments_${videoId}`, JSON.stringify(updatedComments));
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor(diff / (1000 * 60));

        if (minutes < 60) return `${minutes} min ago`;
        if (hours < 24) return `${hours} hours ago`;
        if (days < 30) return `${days} days ago`;
        return date.toLocaleDateString();
    };

    const handleSaveToLibrary = () => {
        const libraryVideos = JSON.parse(localStorage.getItem('library_videos') || '[]');
        
        if (saved) {
            const updated = libraryVideos.filter(v => v.id !== videoId);
            localStorage.setItem('library_videos', JSON.stringify(updated));
            setSaved(false);
        } else {
            libraryVideos.push(video);
            localStorage.setItem('library_videos', JSON.stringify(libraryVideos));
            setSaved(true);
        }
    };

    useEffect(() => {
        const fetchRelatedVideos = async () => {
            try {
                const channelId = video?.snippet?.channelId;
                const searchQuery = Title?.split(' ').slice(0, 3).join(' ') || 'music';
                
                const RelatedData = await axios.get('/search', {
                    params: {
                        part: 'snippet',
                        q: searchQuery,
                        type: 'video',
                        maxResults: 20,
                        key: process.env.REACT_APP_YT_API
                    },
                    headers: {
                        'Cache-Control': 'max-age=2592000'
                    }
                });

                if (RelatedData && RelatedData.data.items) {
                    const videoIds = RelatedData.data.items
                        .filter(item => item.id.videoId !== videoId)
                        .map(item => item.id.videoId)
                        .slice(0, 15)
                        .join(',');
                    
                    if (videoIds) {
                        const VideoDetails = await axios.get('/videos', {
                            params: {
                                part: 'snippet,contentDetails,statistics,player',
                                id: videoIds,
                                key: process.env.REACT_APP_YT_API
                            },
                            headers: {
                                'Cache-Control': 'max-age=2592000'
                            }
                        });

                        if (VideoDetails) {
                            setRelatedVideos(VideoDetails.data.items);
                            setLoadingRelated(false);
                        }
                    } else {
                        setLoadingRelated(false);
                    }
                }
            } catch (error) {
                console.error('Erro ao buscar vídeos relacionados:', error);
                setLoadingRelated(false);
            }
        }
        fetchRelatedVideos();
    }, [videoId, Title, video]);

    return (
        <div className='Player-wrapper'>
            <div className='Player-main flex col'>
                <ReactPlayer playing={true} className="Player-player" url={videoUrl} controls={true} width="100%" height="100%" />

                <div className="Player-details flex col w-100">
                    <h3>{Title}</h3>
                    <div className="Player-info">
                        <div className="Player-MobSection flex gap-1">
                            <div className="Player-channel">
                                <div className="Player-ChLogo">
                                    <img
                                        src={channelData.snippet?.thumbnails?.default.url}
                                        alt={channelData.snippet?.title}
                                        width="40"
                                        height="40"
                                    />
                                </div>

                                <div className="Player-channelInfo flex col">
                                    <h4 className="Player-channelName">{channelData.snippet.title}</h4>
                                    <span className="Player-subscribers">{subscribers} subscribers</span>
                                </div>
                            </div>

                            <div onClick={() => setSubbed(prev => !prev)} className={!subbed ? "Player-subBtn sub" : "Player-subBtn subbed"}>
                                <input type="button" value="Subscribe" />
                            </div>
                        </div>

                        <div className="Player-MobLike flex gap-1">
                            <div className="Player-LikeBtns">
                                <div className="Player-like flex gap-05" onClick={ToggleLike}>
                                    {like === true ? <FaThumbsUp size={24} color="var(--text)" />
                                        : <FaRegThumbsUp size={25} color="var(--text)" />}
                                    <span>{likes}</span>
                                </div>
                                <div className="Player-dislike flex" onClick={ToggleDislike}>
                                    {like === false ? <FaThumbsDown size={24} color="var(--text)" />
                                        : <FaRegThumbsDown size={25} color="var(--text)" />}
                                </div>
                            </div>

                            <div className="Player-notification flex" onClick={() => setNotify(prev => !prev)}>
                                {!notify ? <FaRegBell size={25} color="var(--text)" />
                                    : <FaBell size={25} color="var(--text)" />}
                            </div>

                            <div className="Player-save flex" onClick={handleSaveToLibrary} title={saved ? "Remover da Library" : "Salvar na Library"}>
                                {saved ? <FaBookmark size={25} color="var(--logo)" />
                                    : <FaRegBookmark size={25} color="var(--text)" />}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="Player-comments">
                    <h4>{comments.length} {comments.length === 1 ? 'Comentário' : 'Comentários'}</h4>
                    
                    <form onSubmit={handleAddComment} className="Player-comment-form">
                        <div className="Player-comment-input-wrapper">
                            <div className="Player-comment-avatar">
                                <AiOutlineUser color="var(--text)" size={24} />
                            </div>
                            <div className="Player-comment-input-container">
                                <input
                                    ref={commentInputRef}
                                    type="text"
                                    placeholder="Adicione um comentário público..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    className="Player-comment-input"
                                />
                                <div className="Player-comment-actions">
                                    <button type="button" onClick={() => setCommentText('')} className="Player-comment-cancel">
                                        Cancelar
                                    </button>
                                    <button type="submit" className="Player-comment-submit" disabled={commentText.trim() === ''}>
                                        Comentar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>

                    <div className="Player-comments-list">
                        {comments.length === 0 ? (
                            <p className="Player-no-comments">Seja o primeiro a comentar!</p>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="Player-comment-item">
                                    <div className="Player-comment-avatar">
                                        <AiOutlineUser color="var(--text)" size={24} />
                                    </div>
                                    <div className="Player-comment-content">
                                        <div className="Player-comment-header">
                                            <span className="Player-comment-author">{comment.author}</span>
                                            <span className="Player-comment-date">{formatDate(comment.timestamp)}</span>
                                        </div>
                                        <p className="Player-comment-text">{comment.text}</p>
                                        <div className="Player-comment-footer">
                                            <button 
                                                className="Player-comment-like" 
                                                onClick={() => handleLikeComment(comment.id)}
                                            >
                                                <FaRegThumbsUp size={16} color="var(--text-light)" />
                                                <span>{comment.likes}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="Player-related">
                <h4>Mais vídeos</h4>
                <div className="Player-related-list">
                    {!loadingRelated ? relatedVideos.map((relatedVideo) => {
                        return (
                            <Suspense 
                                fallback={
                                    <div className='skeleton-main'>
                                        <div className="skeleton-thumb" style={{ width: '100%', height: '100px', backgroundColor: 'var(--secondary-alt)', borderRadius: '0.5em', marginBottom: '0.5em' }} />
                                        <div className="skeleton-text" style={{ width: '100%' }}>
                                            <div style={{ width: '90%', height: '16px', backgroundColor: 'var(--secondary-alt)', borderRadius: '0.3em', marginBottom: '0.3em' }} />
                                            <div style={{ width: '60%', height: '14px', backgroundColor: 'var(--secondary-alt)', borderRadius: '0.3em' }} />
                                        </div>
                                    </div>
                                } 
                                key={relatedVideo.id + Math.random()} 
                            >
                                <Videocard video={relatedVideo} />
                            </Suspense>
                        )
                    }) : (
                        Array.from({ length: 10 }).map((_, idx) => (
                            <div className='skeleton-main' key={idx}>
                                <div className="skeleton-thumb" style={{ width: '100%', height: '100px', backgroundColor: 'var(--secondary-alt)', borderRadius: '0.5em', marginBottom: '0.5em' }} />
                                <div className="skeleton-text" style={{ width: '100%' }}>
                                    <div style={{ width: '90%', height: '16px', backgroundColor: 'var(--secondary-alt)', borderRadius: '0.3em', marginBottom: '0.3em' }} />
                                    <div style={{ width: '60%', height: '14px', backgroundColor: 'var(--secondary-alt)', borderRadius: '0.3em' }} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export default Player