// 全局错误监听
window.onerror = function(msg, url, line) {
    const errorBox = document.getElementById('error-mask');
    const errorText = document.getElementById('error-msg');
    if(errorBox && errorText) {
        errorBox.style.display = 'flex';
        errorText.innerText = "错误: " + msg + "\n行号: " + line;
    }
};

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const photoResult = document.getElementById('photo-result');
const startBtn = document.getElementById('start-btn');
const retakeBtn = document.getElementById('retake-btn');
const saveBtn = document.getElementById('save-btn');
const resultControls = document.getElementById('result-controls');
const countdownDisplay = document.getElementById('countdown-display');
// 这里获取的是 IMG 标签
const frameImg = document.getElementById('frame-img');
const qrImg = document.getElementById('qr-hidden');

// 1. 初始化摄像头
async function initCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("⚠️ 无法启动摄像头\n请确保使用 HTTPS 协议，或检查浏览器权限。");
        return;
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: "user", // 前置
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }, 
            audio: false 
        });
        video.srcObject = stream;
        video.play();
    } catch (err) {
        alert("📷 摄像头启动失败: " + err.message);
    }
}

// 2. 倒计时
startBtn.addEventListener('click', () => {
    let count = 3;
    startBtn.style.display = 'none'; 
    countdownDisplay.style.display = 'block';
    countdownDisplay.innerText = count;

    const timer = setInterval(() => {
        count--;
        if (count > 0) {
            countdownDisplay.innerText = count;
        } else {
            clearInterval(timer);
            countdownDisplay.style.display = 'none';
            takePhoto();
        }
    }, 1000);
});

// 3. 拍照与合成 (修复：确保框被画上去)
function takePhoto() {
    // 设置画布尺寸
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    // A. 绘制人像 (镜像翻转)
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    // 这里的 drawImage 可能会因为 object-fit: cover 的视觉差异
    // 导致拍出来的范围比预览看到的多一点点，这是正常物理现象
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // B. 绘制相框 (关键：读取 HTML 里的 img 标签)
    if (frameImg && frameImg.complete) {
        // 强制拉伸绘制，填满整张照片，确保框是完整的
        ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
    } else {
        alert("⚠️ 警告：相框图片似乎还没加载完，照片里可能没有框。");
    }

    // C. 绘制二维码 (右下角)
    const qrWidth = canvas.width * 0.18; // 宽度占 18%
    const margin = 20; 
    if(qrImg && qrImg.complete && qrImg.naturalWidth > 0) {
        ctx.drawImage(qrImg, canvas.width - qrWidth - margin, canvas.height - qrWidth - margin, qrWidth, qrWidth);
    }

    // 生成结果
    const dataUrl = canvas.toDataURL('image/png');
    photoResult.src = dataUrl;
    
    // 切换界面
    photoResult.style.display = 'block';
    frameImg.style.display = 'none'; // 隐藏预览层的框，避免重影
    resultControls.style.display = 'flex';
}

// 4. 重新拍摄
retakeBtn.addEventListener('click', () => {
    photoResult.style.display = 'none';
    frameImg.style.display = 'block'; // 把预览层的框显示回来
    resultControls.style.display = 'none';
    startBtn.style.display = 'block';
    photoResult.src = ""; 
});

// 5. 保存
function downloadImage() {
    const dataUrl = photoResult.src;
    if (!dataUrl) return;
    
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'yunnan_photo_' + Date.now() + '.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert("请长按屏幕中间的图片保存到相册");
}

saveBtn.addEventListener('click', downloadImage);
let pressTimer;
saveBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    pressTimer = setTimeout(downloadImage, 800);
});
saveBtn.addEventListener('touchend', () => clearTimeout(pressTimer));

// 启动
initCamera();