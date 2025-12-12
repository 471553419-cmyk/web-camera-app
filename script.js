const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const photoResult = document.getElementById('photo-result');
const startBtn = document.getElementById('start-btn');
const retakeBtn = document.getElementById('retake-btn');
const saveBtn = document.getElementById('save-btn');
const resultControls = document.getElementById('result-controls');
const countdownDisplay = document.getElementById('countdown-display');
const frameOverlay = document.getElementById('frame');

// 1. 初始化摄像头
async function initCamera() {
    try {
        // 优先使用后置摄像头
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: "environment", // "user" 为前置, "environment" 为后置
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }, 
            audio: false 
        });
        video.srcObject = stream;
    } catch (err) {
        alert("无法调用摄像头: " + err.message + "\n请确保使用HTTPS或localhost，并允许摄像头权限。");
    }
}

// 2. 倒计时拍摄逻辑
startBtn.addEventListener('click', () => {
    let count = 3;
    startBtn.style.display = 'none'; // 隐藏按钮
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

// 3. 拍照功能
function takePhoto() {
    // 设置画布尺寸与视频一致
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    // 将视频当前帧画到画布上
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // 转换为图片URL
    const dataUrl = canvas.toDataURL('image/png');
    photoResult.src = dataUrl;
    
    // 切换UI状态
    photoResult.style.display = 'block';
    frameOverlay.style.display = 'none'; // 拍照后隐藏框
    resultControls.style.display = 'flex';
}

// 4. 重新拍摄
retakeBtn.addEventListener('click', () => {
    photoResult.style.display = 'none';
    frameOverlay.style.display = 'block';
    resultControls.style.display = 'none';
    startBtn.style.display = 'block';
    photoResult.src = ""; // 清空图片
});

// 5. 长按保存逻辑 (移动端兼容性处理)
let pressTimer;

// 触摸开始
saveBtn.addEventListener('touchstart', (e) => {
    e.preventDefault(); // 防止默认点击行为
    pressTimer = setTimeout(() => {
        downloadImage();
    }, 800); // 800ms 算作长按
});

// 触摸结束
saveBtn.addEventListener('touchend', () => {
    clearTimeout(pressTimer);
});

// 点击直接下载（备选）
saveBtn.addEventListener('click', () => {
    downloadImage(); 
});

function downloadImage() {
    const dataUrl = photoResult.src;
    if (!dataUrl) return;

    // 创建临时链接下载
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'photo_' + new Date().getTime() + '.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 提示
    alert("如果未自动下载，请长按屏幕中间的图片选择'保存到手机'。");
}

// 启动
initCamera();