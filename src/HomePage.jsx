import React from "react";
import { useState } from "react";
import "./HomePage.css";

const HomePage = () => {
  const [formData, setFormData] = useState({
    rawText: "",
    platforms: [],
  });

    const [OpenRouterResponse, setOpenRouterResponse] = useState("")
    const [parsedPosts, setParsedPosts] = useState([])
    const [loading, setLoading] = useState(false)

    function parseOpenRouterText(text) {
      if (!text) return [];
      const parts = text.split(/Platform:/i).map((s) => s.trim()).filter(Boolean);
      return parts.map((part) => {
        const match = part.match(/^(.*?)\s*Post:\s*([\s\S]*)$/i);
        if (match) {
          const platform = match[1].replace(/^[:\s]+|[:\s]+$/g, "").trim();
          const post = sanitizeText(match[2].trim());
          return { platform, post };
        }
        const lines = part.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        return { platform: lines[0] || "Unknown", post: sanitizeText(lines.slice(1).join("\n")) || sanitizeText(part) };
      });
    }

    function sanitizeText(text) {
      if (!text) return text;
      // Remove markdown asterisks used for emphasis/bold
      let t = text.replace(/\*/g, "");
      // Remove leading triple (or more) hashes at start of text or start of lines (e.g. "### ")
      t = t.replace(/(^|\n)#{3,}\s*/g, "$1");
      // Remove hash characters that are NOT followed by a word character (so keep #hashtag)
      t = t.replace(/#(?![A-Za-z0-9_])/g, "");
      // Remove occurrences of '#' followed by whitespace (isolated hashes)
      t = t.replace(/#\s+/g, "");
      // Collapse multiple spaces
      t = t.replace(/\s{2,}/g, " ");
      return t.trim();
    }

  async function contactOpenRouter() {
    try {
      const myHeaders = new Headers();
      myHeaders.append(
        "Authorization",
        "Bearer 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"
      );
      myHeaders.append("Content-Type", "application/json");

      const raw = JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Generate social media posts based on the following text: ${formData.rawText}, 
                        for the following platforms: ${formData.platforms.join(", ")}
                        Make sure the posts are engaging and suitable for each platform and Descibe the project in depth.
                        Output Stucture:
                        Platform: <platform name>
                        Post: <post content>
                        Each post should have hashtags and emojis.
                        One more thing no need of initial description just give me the posts directly.
                        and for each post along with descriptio add few more relevant point wise statements.
                        `,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };

      setLoading(true);
      fetch("https://openrouter.ai/api/v1/chat/completions", requestOptions)
        .then((response) => response.json())
        .then((result) => {
          const text = result.choices?.[0]?.message?.content || "";
          const sanitized = sanitizeText(text);
          setOpenRouterResponse(sanitized);
          setParsedPosts(parseOpenRouterText(sanitized));
          console.log(sanitized);
        })
        .catch((error) => console.error(error))
        .finally(() => setLoading(false));
    } 
    catch (err) {
      console.error("Error in contacting OpenRouter:", err);
    }
  }

  return (
    <div>
      <h1 id="page-title">Social Media Post Generator</h1>
      <form>
        <div className="section-center">
          <h2 className="section-title">Enter your text here</h2>
          <textarea
            name="rawText"
            id="rawText"
            rows={8}
            cols={40}
            value={formData.rawText}
            onChange={(e) =>
              setFormData({ ...formData, rawText: e.target.value })
            }
          ></textarea>
        </div>
        <br />

        <h3 className="section-title">Select Platforms:</h3>
        <div className="platforms">
          <div>
            <input
              type="checkbox"
              name="platforms"
              value={"Linkedin"}
              id="Linkedin"
              onChange={(e) => {
                if (e.target.checked) {
                  setFormData({
                    ...formData,
                    platforms: [...formData.platforms, e.target.value],
                  });
                } else {
                  setFormData({
                    ...formData,
                    platforms: formData.platforms.filter(
                      (platform) => platform !== e.target.value
                    ),
                  });
                }
                console.log(e.target.value, ":", e.target.checked);
              }}
            />
            <span> Linkedin </span>
          </div>
          <div>
            <input
              type="checkbox"
              name="platforms"
              value={"twitter"}
              id="twitter"
              onChange={(e) => {
                if (e.target.checked) {
                  setFormData({
                    ...formData,
                    platforms: [...formData.platforms, e.target.value],
                  });
                } else {
                  setFormData({
                    ...formData,
                    platforms: formData.platforms.filter(
                      (platform) => platform !== e.target.value
                    ),
                  });
                }
                console.log(e.target.value, ":", e.target.checked);
              }}
            />
            <span> Twitter </span>
          </div>
          <div>
            <input
              type="checkbox"
              name="platforms"
              value={"instagram"}
              id="instagram"
              onChange={(e) => {
                if (e.target.checked) {
                  setFormData({
                    ...formData,
                    platforms: [...formData.platforms, e.target.value],
                  });
                } else {
                  setFormData({
                    ...formData,
                    platforms: formData.platforms.filter(
                      (platform) => platform !== e.target.value
                    ),
                  });
                }
                console.log(e.target.value, ":", e.target.checked);
              }}
            />
            <span> Instagram </span>
          </div>
        </div>

        <div className="center-row">
          <button type="button" onClick={contactOpenRouter} disabled={loading}>
            {loading ? "Processing..." : "GENERATE"}
          </button>
        </div>

        {loading && (
          <div className="center-row">
            <div className="loading-message">please wait.... your request is being processed</div>
          </div>
        )}
      </form>

      {parsedPosts.length > 0 ? (
        <div className="posts-container">
          {parsedPosts.map((p, idx) => (
            <div className="post-card" key={idx}>
              <div className="platform">{p.platform}</div>
              <div className="post-content">
                {p.post.split(/\n/).map((line, i) => (
                  <div key={i} className="post-line">
                    {line.split(/\s+/).map((word, j) =>
                      word.startsWith("#") ? (
                        <span key={j} className="hashtag">{word} </span>
                      ) : (
                        <span key={j}>{word} </span>
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        OpenRouterResponse.length > 0 && (
          <pre className="raw-response">{OpenRouterResponse}</pre>
        )
      )}
    </div>
  );
};


export default HomePage