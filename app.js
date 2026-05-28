const form = document.querySelector("#alert-form");
const previewButton = document.querySelector("#preview-button");
const previewBox = document.querySelector("#preview-box");
const statusText = document.querySelector("#status-text");
const sendButton = document.querySelector("#send-button");

function toAsciiHeaderValue(value, fallback) {
  const trimmed = (value || "").trim();
  if (!trimmed) {
    return fallback;
  }

  return /^[\x00-\x7F]*$/.test(trimmed) ? trimmed : fallback;
}

function setStatus(message, isError = false) {
  statusText.textContent = message;
  statusText.style.color = isError ? "#b42318" : "#1f2a2c";
}

function collectFormData() {
  return {
    serverUrl: document.querySelector("#server-url").value.trim().replace(/\/$/, ""),
    topic: document.querySelector("#topic").value.trim(),
    title: document.querySelector("#title").value.trim(),
    recipient: document.querySelector("#recipient").value.trim(),
    presetMessage: document.querySelector("#preset-message").value,
    note: document.querySelector("#note").value.trim(),
  };
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("当前浏览器不支持地理定位。"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
    });
  });
}

function buildPayload(formData, position) {
  const latitude = position.coords.latitude.toFixed(6);
  const longitude = position.coords.longitude.toFixed(6);
  const sentAt = new Date().toLocaleString("zh-CN", { hour12: false });
  const mapUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
  const safeTitle = formData.title || "家人位置提醒";

  const bodyLines = [
    `标题：${safeTitle}`,
    `收件人：${formData.recipient || "未填写"}`,
    `短讯：${formData.presetMessage}`,
    formData.note ? `补充：${formData.note}` : null,
    `时间：${sentAt}`,
    `经纬度：${latitude}, ${longitude}`,
    `地图：${mapUrl}`,
  ].filter(Boolean);

  return {
    latitude,
    longitude,
    sentAt,
    mapUrl,
    messageBody: bodyLines.join("\n"),
  };
}

async function renderPreview() {
  const formData = collectFormData();
  setStatus("正在获取当前位置，用于生成预览。");

  try {
    const position = await getCurrentPosition();
    const payload = buildPayload(formData, position);
    previewBox.textContent = payload.messageBody;
    setStatus("预览已生成，可以直接发送。");
  } catch (error) {
    setStatus(`无法生成预览：${error.message}`, true);
  }
}

async function sendLocationAlert() {
  const formData = collectFormData();

  if (!formData.serverUrl || !formData.topic) {
    setStatus("请先填写通知服务器和主题。", true);
    return;
  }

  sendButton.disabled = true;
  sendButton.textContent = "发送中...";
  setStatus("正在读取当前位置并发送通知。");

  try {
    const position = await getCurrentPosition();
    const payload = buildPayload(formData, position);
    const headerTitle = toAsciiHeaderValue(formData.title, "Location alert");
    previewBox.textContent = payload.messageBody;

    const response = await fetch(`${formData.serverUrl}/${encodeURIComponent(formData.topic)}`, {
      method: "POST",
      headers: {
        Title: headerTitle,
        Priority: "urgent",
        Tags: "round_pushpin,calling",
        Click: payload.mapUrl,
        "Content-Type": "text/plain; charset=utf-8",
      },
      body: payload.messageBody,
    });

    if (!response.ok) {
      throw new Error(`服务器返回 ${response.status} ${response.statusText}`);
    }

    setStatus("通知已发送。用户B订阅该主题后，应能在手机或电脑上收到提醒。");
  } catch (error) {
    setStatus(`发送失败：${error.message}`, true);
  } finally {
    sendButton.disabled = false;
    sendButton.textContent = "发送我的当前位置";
  }
}

previewButton.addEventListener("click", renderPreview);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  await sendLocationAlert();
});
