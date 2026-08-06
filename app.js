/**
 * ==========================================================================
 * 귀여운 개구리 날씨 대시보드 메인 스크립트 (app.js)
 * --------------------------------------------------------------------------
 * 1. 2.0 mm/h 이상인 지역 (서울 8.5mm, 독도 22mm) -> 시원한 푸른 빗줄기 파티클 가동!
 * 2. 2.0 mm/h 미만인 지역 (제주 0.0mm, 부산 0.0mm) -> 비 파티클 완전 차단 (OFF)
 * ==========================================================================
 */

console.log('[WeatherApp] app.js v30000 2.0mm 이상 비 파티클 완벽 구동판 로딩');

// 1. DOM 요소 참조
const canvas = document.getElementById('weatherCanvas');
const ctx = canvas.getContext('2d');
const rainContainer = document.getElementById('rainContainer');

const rainfallSlider = document.getElementById('rainfallSlider');
const sliderDisplayValue = document.getElementById('sliderDisplayValue');
const rainfallNumber = document.getElementById('rainfallNumber');
const statusTitle = document.getElementById('statusTitle');
const statusDesc = document.getElementById('statusDesc');

const mascotImage = document.getElementById('mascotImage');
const speechBubble = document.getElementById('speechBubble');
const characterGlow = document.getElementById('characterGlow');
const currentWeatherBadge = document.getElementById('currentWeatherBadge');

const realtimeLocSelect = document.getElementById('realtimeLocSelect');
const fetchApiBtn = document.getElementById('fetchApiBtn');
const displayLocationName = document.getElementById('displayLocationName');

const umbrellaTip = document.getElementById('umbrellaTip');
const outfitTip = document.getElementById('outfitTip');
const activityTip = document.getElementById('activityTip');

const openGalleryBtn = document.getElementById('openGalleryBtn');
const closeGalleryBtn = document.getElementById('closeGalleryBtn');
const galleryModal = document.getElementById('galleryModal');

// 2. 날씨 상태별 귀여운 개구리 데이터
const WEATHER_CONFIGS = {
    sunny: {
        badge: '🐸 ☀️ 맑음 개구리',
        title: '햇살 가득한 맑은 날',
        image: 'assets/sunny.png',
        glow: 'rgba(245, 158, 11, 0.25)',
        speech: '"개굴! 오늘은 햇살이 눈부셔서 멋진 선글라스를 썼어요! ☀️"',
        desc: '비 소식이 전혀 없는 맑은 날씨입니다. 쾌적하게 산책을 즐겨보세요!',
        umbrella: '우산이 필요 없는 맑은 날씨입니다.',
        outfit: '선글라스나 시원하고 가벼운 옷차림 추천!',
        activity: '개구리가 연못가에서 일광욕하기 최고입니다 (100점)'
    },
    cloudy: {
        badge: '🐸 ☁️ 흐림 개구리',
        title: '구름 많은 흐린 날',
        image: 'assets/cloudy.png',
        glow: 'rgba(100, 116, 139, 0.2)',
        speech: '"개굴~ 하늘에 구름 모자가 생겼어요! 차분해서 휴식하기 좋아요. ☁️"',
        desc: '2.0mm 미만의 비 파티클이 없는 잔잔한 흐림 날씨입니다.',
        umbrella: '혹시 모를 소나기에 대비해 접이우산을 챙겨두세요.',
        outfit: '가벼운 가디건이나 편안한 옷차림',
        activity: '가벼운 산책이나 휴식을 즐기기 좋습니다 (75점)'
    },
    drizzle: {
        badge: '🐸 🌧️ 소슬비 개구리',
        title: '보슬보슬 비 내리는 날',
        image: 'assets/drizzle.png',
        glow: 'rgba(2, 132, 199, 0.25)',
        speech: '"개굴! 보슬보슬 비가 와요! 연꽃잎 우산과 우비를 착용했어요! 🌧️"',
        desc: '2.0mm/h 이상의 비가 내립니다. 푸른 빗줄기 파티클이 화면 전체에 떨어집니다.',
        umbrella: '귀여운 소형 우산이나 우비를 준비하세요.',
        outfit: '젖어도 잘 마르는 방수 의류와 가벼운 신발',
        activity: '개구리가 제일 좋아하는 비 오는 날 촉촉한 산책! (90점)'
    },
    heavy_rain: {
        badge: '🐸 ⛈️ 폭우 개구리',
        title: '세찬 비바람이 불어오는 폭우',
        image: 'assets/heavy_rain.png',
        glow: 'rgba(79, 70, 229, 0.3)',
        speech: '"개굴!! 장대비가 거세게 쏟아져요! 큰 우산과 우비를 꼭 챙기세요! ⛈️"',
        desc: '15.0mm/h 이상의 세찬 폭우가 쏟아집니다! 거센 빗줄기 파티클이 발생합니다.',
        umbrella: '튼튼한 장우산과 우비, 방수 레인부츠 필수!',
        outfit: '완전 방수 재킷과 단단한 신발',
        activity: '야외 이동을 자제하고 실내에 머무르세요 (20점)'
    },
    snow: {
        badge: '🐸 ❄️ 겨울눈 개구리',
        title: '하얀 눈송이가 내리는 겨울날',
        image: 'assets/snow.png',
        glow: 'rgba(56, 189, 248, 0.25)',
        speech: '"개굴! 뽀득뽀득 하얀 눈이 내려요! 빨간 목도리를 두르고 눈사람을 만들었어요! ❄️"',
        desc: '함박눈이 내리고 있습니다. 빙판길 미끄럼에 주의하세요.',
        umbrella: '눈을 털어내기 좋은 우산을 준비하세요.',
        outfit: '따뜻한 겨울 패딩, 빨간 목도리, 털모자 필수!',
        activity: '눈사람 만들기나 겨울 산책을 즐겨보세요 (85점)'
    }
};

// 3. 실시간 앱 상태
let currentRainfall = 0.0;
let currentStatusKey = 'sunny';
let currentParticleType = 'sun';

// ==========================================================================
// 4. [2.0mm 이상 비 파티클 100% 가동 / 2.0mm 미만 완전 차단]
// ==========================================================================
function renderDOMRainDrops(rainValue, statusKey) {
    if (!rainContainer) return;

    // 강수량이 2.0 mm/h 미만이거나 맑음/흐림/눈이면 비 파티클 완전 삭제(OFF)
    if (rainValue < 2.0 || statusKey === 'sunny' || statusKey === 'cloudy' || statusKey === 'snow') {
        rainContainer.classList.remove('active-rain');
        rainContainer.style.display = 'none';
        rainContainer.innerHTML = ''; // 자식 요소 완전 삭제
        console.log(`[WeatherApp] ☀️ 강수량 ${rainValue}mm/h (< 2.0mm) - 비 파티클 완전 OFF`);
    } else {
        // 강수량이 2.0 mm/h 이상이고 비 상태일 때는 푸른 빗줄기 파티클 100% 생성(ON)
        rainContainer.innerHTML = '';
        const isHeavy = statusKey === 'heavy_rain';
        let dropCount = Math.floor(rainValue * 2.5) + 40;

        for (let i = 0; i < dropCount; i++) {
            const drop = document.createElement('div');
            drop.className = isHeavy ? 'heavy-rain-drop' : 'rain-drop';

            const left = Math.random() * 100;
            const duration = isHeavy ? (Math.random() * 0.4 + 0.3) : (Math.random() * 0.6 + 0.45);
            const delay = Math.random() * 1.5;
            const height = isHeavy ? (Math.random() * 25 + 35) : (Math.random() * 18 + 24);

            drop.style.left = `${left}vw`;
            drop.style.height = `${height}px`;
            drop.style.animationDuration = `${duration}s`;
            drop.style.animationDelay = `${delay}s`;

            rainContainer.appendChild(drop);
        }

        rainContainer.classList.add('active-rain');
        rainContainer.style.display = 'block';
        console.log(`[WeatherApp] ☔ 강수량 ${rainValue}mm/h (>= 2.0mm) - 빗줄기 ${dropCount}개 100% 가동 (ON)`);
    }
}

// 5. Canvas 파티클 배경 엔진
let particles = [];
let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;
let flashOpacity = 0;

function resizeCanvas() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor(type) {
        this.reset(type);
    }

    reset(type) {
        this.type = type;
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * -canvasHeight;

        if (type === 'rain' || type === 'heavy_rain') {
            const intensity = Math.max(currentRainfall, 1.0) / 100;
            this.length = Math.random() * 25 + 20 + (type === 'heavy_rain' ? 20 : 0);
            this.speed = Math.random() * 10 + 14 + intensity * 20;
            this.opacity = Math.random() * 0.4 + 0.6;
            this.wind = (Math.random() - 0.5) * 3 + (type === 'heavy_rain' ? -4 : -1);
        } else if (type === 'snow') {
            this.radius = Math.random() * 3.5 + 2;
            this.speed = Math.random() * 1.5 + 1.0;
            this.wind = Math.sin(Math.random() * Math.PI) * 0.8;
            this.opacity = Math.random() * 0.5 + 0.3;
        } else if (type === 'sun') {
            this.radius = Math.random() * 4 + 2;
            this.speed = Math.random() * 0.5 + 0.2;
            this.opacity = Math.random() * 0.3 + 0.15;
            this.y = Math.random() * canvasHeight;
        } else if (type === 'cloud') {
            this.radius = Math.random() * 35 + 20;
            this.speed = Math.random() * 0.3 + 0.1;
            this.opacity = Math.random() * 0.1 + 0.04;
        }
    }

    update() {
        if (this.type === 'rain' || this.type === 'heavy_rain') {
            this.y += this.speed;
            this.x += this.wind;

            if (this.y > canvasHeight) {
                this.reset(this.type);
            }
        } else if (this.type === 'snow') {
            this.y += this.speed;
            this.x += Math.sin(this.y * 0.01) * 0.6;

            if (this.y > canvasHeight) {
                this.reset(this.type);
            }
        } else if (this.type === 'sun') {
            this.y -= this.speed;
            if (this.y < 0) {
                this.y = canvasHeight;
                this.x = Math.random() * canvasWidth;
            }
        } else if (this.type === 'cloud') {
            this.x += this.speed;
            if (this.x > canvasWidth + 60) {
                this.x = -60;
                this.y = Math.random() * (canvasHeight / 2);
            }
        }
    }

    draw() {
        ctx.beginPath();
        if (this.type === 'rain' || this.type === 'heavy_rain') {
            ctx.strokeStyle = this.type === 'heavy_rain' ? `rgba(30, 58, 138, ${this.opacity})` : `rgba(2, 132, 199, ${this.opacity})`;
            ctx.lineWidth = this.type === 'heavy_rain' ? 2.8 : 2.0;
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.wind * 2, this.y + this.length);
            ctx.stroke();
        } else if (this.type === 'snow') {
            ctx.fillStyle = `rgba(56, 189, 248, ${this.opacity})`;
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'sun') {
            ctx.fillStyle = `rgba(245, 158, 11, ${this.opacity})`;
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'cloud') {
            ctx.fillStyle = `rgba(148, 163, 184, ${this.opacity})`;
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function initParticles() {
    particles = [];
    let count = 40;

    if (currentParticleType === 'rain') {
        count = Math.floor(currentRainfall * 8) + 60;
    } else if (currentParticleType === 'heavy_rain') {
        count = Math.floor(currentRainfall * 10) + 100;
    } else if (currentParticleType === 'snow') {
        count = 80;
    } else if (currentParticleType === 'sun') {
        count = 30;
    } else if (currentParticleType === 'cloud') {
        count = 12;
    }

    for (let i = 0; i < count; i++) {
        particles.push(new Particle(currentParticleType));
    }
}

function renderCanvas() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    if (currentStatusKey === 'heavy_rain') {
        if (Math.random() < 0.01) {
            flashOpacity = 0.2;
        }
    }
    if (flashOpacity > 0) {
        ctx.fillStyle = `rgba(224, 231, 255, ${flashOpacity})`;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        flashOpacity -= 0.02;
    }

    // 2.0mm 이상일 때만 Canvas 비 파티클 렌더링
    if (currentParticleType === 'rain' || currentParticleType === 'heavy_rain') {
        if (currentRainfall >= 2.0) {
            particles.forEach(p => {
                p.update();
                p.draw();
            });
        }
    } else {
        particles.forEach(p => {
            p.update();
            p.draw();
        });
    }

    requestAnimationFrame(renderCanvas);
}

initParticles();
renderCanvas();

// 6. 메인 상태 및 캐릭터 변경 핵심 함수
function updateWeatherState(rainValue, forcedStatusKey = null, customLocationName = null) {
    const rain = parseFloat(rainValue);
    currentRainfall = isNaN(rain) ? 0 : rain;

    if (forcedStatusKey) {
        currentStatusKey = forcedStatusKey;
    } else if (currentRainfall === 0) {
        currentStatusKey = 'sunny';
    } else if (currentRainfall < 2.0) {
        currentStatusKey = 'cloudy';
    } else if (currentRainfall <= 15.0) {
        currentStatusKey = 'drizzle';
    } else {
        currentStatusKey = 'heavy_rain';
    }

    // 파티클 타입 지정
    if (currentStatusKey === 'heavy_rain') currentParticleType = 'heavy_rain';
    else if (currentStatusKey === 'drizzle') currentParticleType = 'rain';
    else if (currentStatusKey === 'cloudy') currentParticleType = 'cloud';
    else if (currentStatusKey === 'snow') currentParticleType = 'snow';
    else currentParticleType = 'sun';

    const config = WEATHER_CONFIGS[currentStatusKey];

    // UI 텍스트 수치 변경
    rainfallNumber.textContent = currentRainfall.toFixed(1);
    sliderDisplayValue.textContent = `${currentRainfall.toFixed(1)} mm/h`;
    rainfallSlider.value = currentRainfall;
    currentWeatherBadge.textContent = config.badge;
    statusTitle.textContent = config.title;
    statusDesc.textContent = config.desc;

    if (customLocationName) {
        displayLocationName.textContent = customLocationName;
    }

    // 개구리 캐릭터 변경
    mascotImage.src = config.image;
    speechBubble.textContent = config.speech;
    characterGlow.style.background = config.glow;

    umbrellaTip.textContent = config.umbrella;
    outfitTip.textContent = config.outfit;
    activityTip.textContent = config.activity;

    // 2.0mm 이상 비 파티클 가동 및 캐릭터 동기화
    renderDOMRainDrops(currentRainfall, currentStatusKey);
    initParticles();
}

// 7. 실시간 API 연동 이벤트
if (fetchApiBtn) {
    fetchApiBtn.addEventListener('click', () => {
        const cityKey = realtimeLocSelect.value;
        if (typeof fetchRealtimeWeather === 'function') {
            fetchRealtimeWeather(cityKey);
        }
    });
}

if (realtimeLocSelect) {
    realtimeLocSelect.addEventListener('change', () => {
        const cityKey = realtimeLocSelect.value;
        if (typeof fetchRealtimeWeather === 'function') {
            fetchRealtimeWeather(cityKey);
        }
    });
}

openGalleryBtn.addEventListener('click', () => galleryModal.classList.remove('hidden'));
closeGalleryBtn.addEventListener('click', () => galleryModal.classList.add('hidden'));

galleryModal.addEventListener('click', (e) => {
    if (e.target === galleryModal) galleryModal.classList.add('hidden');
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !galleryModal.classList.contains('hidden')) {
        galleryModal.classList.add('hidden');
    }
});

// 외부 API 수신 전용 함수
window.setWeatherData = function(data) {
    if (typeof data.rain !== 'undefined') {
        const rainValue = parseFloat(data.rain);
        updateWeatherState(rainValue, data.status || null, data.locationName || null);
    }
};

// 8. 초기 실행 (선택된 드롭다운 값 수신)
if (realtimeLocSelect && typeof fetchRealtimeWeather === 'function') {
    fetchRealtimeWeather(realtimeLocSelect.value);
} else {
    updateWeatherState(0.0, 'sunny', '제주특별자치도 🌴');
}
