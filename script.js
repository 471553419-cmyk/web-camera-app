// 全局错误监听：如果代码崩了，直接弹窗显示原因
window.onerror = function(msg, url, line) {
    const errorBox = document.getElementById('error-mask');
    const errorText = document.getElementById('error-msg');
    if(errorBox && errorText) {
        errorBox.style.display = 'flex';
        errorText.innerText = "错误: " + msg + "\n行号: " + line;
    }
    alert("❌ 程序发生错误:\n" + msg);
};

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const photoResult = document.getElementById('photo-result');
const startBtn = document.getElementById('start-btn');
const retakeBtn = document.getElementById('retake-btn');
const saveBtn = document.getElementById('save-btn');
const resultControls = document.getElementById('result-controls');
const countdownDisplay = document.getElementById('countdown-display');
const frameLayer = document.getElementById('frame-layer');
const qrImg = document.getElementById('qr-hidden');

// 1. 初始化摄像头
async function initCamera() {
    // 兼容性检查
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("⚠️ 无法启动摄像头\n\n原因可能是：\n1. 不是 HTTPS 环境 (GitHub Pages 是支持的)\n2. 在微信中未授权 (请点右上角在浏览器打开)\n3. 系统权限未开启");
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
        alert("📷 摄像头调用被拒绝或出错:\n" + err.name + ": " + err.message);
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

// 3. 拍照与合成
function takePhoto() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    // A. 绘制人像 (镜像)
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // B. 绘制二维码 (右下角)
    // ⚠️ 注意：当前方案下，保存的图片暂时没有相框（因为Base64在CSS里JS读不到）
    // 我们先确保摄像头能用，下一步再解决保存带框的问题。
    const qrWidth = canvas.width * 0.18;
    const margin = 20; 
    if(qrImg.complete && qrImg.naturalWidth > 0) {
        ctx.drawImage(qrImg, canvas.width - qrWidth - margin, canvas.height - qrWidth - margin, qrWidth, qrWidth);
    }

    // 生成图片
    const dataUrl = canvas.toDataURL('image/png');
    photoResult.src = dataUrl;
    
    photoResult.style.display = 'block';
    frameLayer.style.display = 'none'; // 隐藏预览框
    resultControls.style.display = 'flex';
}

// 4. 重新拍摄
retakeBtn.addEventListener('click', () => {
    photoResult.style.display = 'none';
    frameLayer.style.display = 'block'; // 显示预览框
    resultControls.style.display = 'none';
    startBtn.style.display = 'block';
    photoResult.src = ""; 
});

// 5. 保存
function downloadImage() {
    const dataUrl = photoResult.src;
    if (!dataUrl) return;
    
    // 创建链接下载
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'photo_' + Date.now() + '.png';
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