import DOMPurify from 'dompurify';


export function formatMessageTime(date){
    return new Date(date).toLocaleTimeString("en-US",{
        hour : "2-digit",
        minute : "2-digit",
        hour12 : false,
    })
}



export function formatMessageText(text) {
  if (!text) return "";

  const urlRegex = /\b((https?:\/\/)?(www\.)?[\w-]+\.[\w.-]+(\S*)?)/gi;

  const formattedText = text.replace(urlRegex, (url) => {
    let link = url;
    if (!/^https?:\/\//i.test(url)) {
      link = 'http://' + url; // auto add http
    }
    return `<a href="${link}" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline">${url}</a>`;
  });

  return DOMPurify.sanitize(formattedText);
}


export const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return "Never";
    const now = new Date();
    const diffMs = now - new Date(lastSeen);
    const diffMins = Math.round(diffMs / 60000); // Convert to minutes

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return new Date(lastSeen).toLocaleString();
};