import axios from "axios";

export default async function FetchContent(videoId) {
    const { data } = await axios.get('/api/youtube', {
        params: {
            endpoint: "videos",
            part: "contentDetails,statistics",
            id: videoId
        }
    });
    return data;
}