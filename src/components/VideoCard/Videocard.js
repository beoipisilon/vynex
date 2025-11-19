import "./Videocard.css";
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { parse } from "tinyduration";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useApiRequest } from '../../hooks/useApiRequest';

const Videocard = ({ video }) => {
    const navigate = useNavigate();
    const { makeRequest } = useApiRequest();
    const cardRef = useRef(null);
    var { title, thumbnails, channelId, channelTitle, publishedAt } = video.snippet;
    var { duration } = video.contentDetails;
    var { viewCount } = video.statistics;

    //Dotter overflowing Title
    if (title.length > 55) {
        var Title = title.substring(0, 55) + '...';
    } else {
        Title = title;
    }

    //Thumbnail img
    var url = thumbnails.maxres?.url || thumbnails.high?.url || thumbnails.medium?.url || thumbnails.standard?.url || thumbnails.default?.url;
    // var url = thumbnails.standard?.url || thumbnails.medium?.url || thumbnails.high?.url || thumbnails.default?.url || thumbnails.maxres?.url;

    const [channelData, setChannelData] = useState(null);
    const [shouldLoadChannel, setShouldLoadChannel] = useState(false);
    let { hours, minutes, seconds } = parse(duration);
    seconds = seconds < 10 ? `0${seconds}` : seconds;
    minutes = hours > 0 ? minutes < 10 ? `0${minutes}` : minutes : minutes;
    let timestamp;
    hours ? timestamp = `${hours || '0'}:${minutes || '00'}:${seconds || '00'}`
        : timestamp = `${minutes || '00'}:${seconds || '00'}`;

    //Views formatting
    var views = Intl.NumberFormat('en', { notation: "compact" }).format(viewCount);

    //Upload date formatting
    var publishDate = new Date(publishedAt);
    var currentDate = new Date();
    var diff = currentDate - publishDate;

    var hrs = Math.floor(diff / (1000 * 60 * 60));
    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    var years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
    var uploadDate;
    if (hrs < 24) {
        uploadDate = `${hrs} hours ago`;
    }
    else if (days < 30) {
        uploadDate = `${days} days ago`;
    }
    else if (months < 12) {
        uploadDate = `${months} months ago`;
    }
    else {
        uploadDate = `${years} years ago`;
    }

    useEffect(() => {
        if (!cardRef.current || shouldLoadChannel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !shouldLoadChannel) {
                        setShouldLoadChannel(true);
                    }
                });
            },
            { threshold: 0.1 }
        );

        observer.observe(cardRef.current);

        return () => {
            if (cardRef.current) {
                observer.unobserve(cardRef.current);
            }
        };
    }, [shouldLoadChannel]);

    useEffect(() => {
        if (!shouldLoadChannel || !channelId) return;

        let isMounted = true;

        const GetChannelData = async () => {
            try {
                const ChannelData = await makeRequest(
                    '/api/youtube',
                    {
                        params: {
                            endpoint: 'channels',
                            part: 'snippet,statistics',
                            id: channelId
                        }
                    },
                    `channel-${channelId}`
                );
                
                if (isMounted && ChannelData && ChannelData.data && ChannelData.data.items && ChannelData.data.items[0]) {
                    setChannelData(ChannelData.data.items[0]);
                }
            } catch (error) {
                if (isMounted && error.message !== 'Request cancelled') {
                    console.error('Erro ao buscar dados do canal:', error);
                }
            }
        }
        
        GetChannelData();

        return () => {
            isMounted = false;
        };
    }, [shouldLoadChannel, channelId, video.id, makeRequest]);

    var VideoProp = {
        video,
        channelData,
        Title,
        uploadDate,
        views
    }


    return (
        <div className='videocard-main' ref={cardRef}>
            <Link to={`/watch/${video.id}`} className='videocard-thumb' state={VideoProp}>
                <span className="videocard-timestamp">{timestamp}</span>
                <LazyLoadImage src={url} alt={title} effect="blur" />
                {/* <img src={url} alt={title} /> */}
            </Link>
            <div className="videocard-info">
                <div 
                    className="videocard-avatar"
                    onClick={(e) => {
                        e.preventDefault();
                        if (channelId) navigate(`/channel/${channelId}`);
                    }}
                    style={{ cursor: 'pointer' }}
                >
                    {channelData?.snippet?.thumbnails?.default?.url ? (
                        <LazyLoadImage
                            src={channelData.snippet.thumbnails.default.url}
                            alt={channelTitle}
                            width={36}
                            height={36}
                            effect="blur" />
                    ) : (
                        <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--secondary-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)', fontSize: '0.8em' }}>
                            {channelTitle?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                    )}
                    {/* <img
                        src={channelData.snippet?.thumbnails?.default.url}
                        alt={channelData.snippet?.title}
                        width="36"
                        height="36"
                    /> */}
                </div>
                <div className="videocard-details flex col">
                    <div className="videocard-title">{Title}</div>
                    <div className="videocard-channel flex col">
                        <div 
                            className="videocard-channelName" 
                            onClick={(e) => {
                                e.preventDefault();
                                if (channelId) navigate(`/channel/${channelId}`);
                            }}
                            style={{ cursor: 'pointer' }}
                        >
                            {channelTitle}
                        </div>
                        <div className="videocard-footer">
                            <div className="videocard-views">{views}</div>
                            <div className="videocard-uploaded">{uploadDate}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Videocard