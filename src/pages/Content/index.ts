import { youtube_v3 } from 'googleapis/build/src/apis/youtube/v3';
import axios from 'axios'

const client = axios.create({
  baseURL: 'https://www.googleapis.com/youtube/v3/',
  params: {
    key: process.env.API_KEY
  }
})

function getVideoId () {
  const params = new URLSearchParams(window.location.search);
  const videoId = params.get('v') || '';

  return videoId;
}

async function getVideoStatistics() {
  const videoId = getVideoId();

  const {
    data: {
      items
    }
  }: { data: { items: youtube_v3.Schema$Video[] } } = await client.get('videos', {
    params: {
      part: 'statistics',
      id: videoId
    }
  })

  if (items?.length === 0) {
    return {};
  }

  const {
    likeCount: likeCountString,
    dislikeCount: dislikeCountString,
  } = items![0]!.statistics!;

  const likeCount = parseInt(likeCountString!, 10);
  const dislikeCount = parseInt(dislikeCountString!, 10);

  const percentage = likeCount! / (likeCount! + dislikeCount!) * 100;
  
  const barElement = document.createElement('div')
  barElement.setAttribute('id', 'sentiment')
  barElement.setAttribute('system-icons', '')
  barElement.setAttribute('style', `width: 145px;`)
  barElement.className = 'style-scope ytd-video-primary-info-renderer'
  barElement.title = `${likeCount} / ${likeCount + dislikeCount}`
  barElement.innerHTML = `
    <div id="container" class="style-scope ytd-sentiment-bar-renderer">
      <div id="like-bar" class="style-scope ytd-sentiment-bar-renderer" style="width: ${percentage}%;"></div>
  </div>
`

  document.querySelector('#menu-container.ytd-video-primary-info-renderer')?.append(barElement)
}

window.addEventListener('load', () => {
  getVideoStatistics();
});
