function formatTime(seconds: number): string {
  const date = new Date(seconds * 1000);
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const secs = String(date.getUTCSeconds()).padStart(2, '0');
  const millis = String(date.getUTCMilliseconds()).padStart(3, '0');
  return `${hours}:${minutes}:${secs},${millis}`;
}

export function formatSubtitlesToSRT(subtitles: Subtitle[]): string {
  return subtitles
    .map((subtitle, index) => {
      const startTime = formatTime(subtitle.start);
      const endTime = formatTime(subtitle.end);
      return `${index + 1}\n${startTime} --> ${endTime}\n${subtitle.text}\n`;
    })
    .join('\n');
}
