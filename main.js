const fs = require('fs');
const { google } = require('googleapis');

const apiKey = ''; // Genrate your own api key from google console
const channelId = ""; // Add the channel of the youtube you want to retrieve urls
const channelHandle = ''; // Replace with the actual channel handle

const youtube = google.youtube({
  version: 'v3',
  auth: apiKey
});

async function getUploadsPlaylistId(channelId) {
  const response = await youtube.channels.list({
    part: 'contentDetails',
    id: channelId
  });

  const uploadsPlaylistId = response.data.items[0].contentDetails.relatedPlaylists.uploads;
  return uploadsPlaylistId;
}

async function getAllVideosFromPlaylist(playlistId) {
  let videoLinks = [];
  let nextPageToken = '';

  do {
    const response = await youtube.playlistItems.list({
      playlistId: playlistId,
      part: 'snippet',
      maxResults: 50,
      pageToken: nextPageToken
    });

    response.data.items.forEach(item => {
      const videoId = item.snippet.resourceId.videoId;
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      videoLinks.push(videoUrl);
    });

    nextPageToken = response.data.nextPageToken;
  } while (nextPageToken);

  return videoLinks;
}

async function saveToTxt(videoLinks) {
  const filePath = 'all_youtube_video_links.txt';
  const fileContent = videoLinks.join('\n');

  fs.writeFile(filePath, fileContent, (err) => {
    if (err) {
      console.error('Error:', err.message);
    } else {
      console.log(`Saved ${videoLinks.length} video links to ${filePath}`);
    }
  });
}

(async () => {
  try {
    const uploadsPlaylistId = await getUploadsPlaylistId(channelId);
    const videoLinks = await getAllVideosFromPlaylist(uploadsPlaylistId);
    await saveToTxt(videoLinks);
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
