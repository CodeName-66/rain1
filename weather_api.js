/**
 * ==========================================================================
 * 지역별 날씨 예보 데이터 제어 스크립트 (weather_api.js)
 * --------------------------------------------------------------------------
 * 외부 API 호출 없이, 내부 지역별 날씨 데이터만을 기반으로 정직하고 깔끔하게 동작합니다.
 * - 서울특별시: 8.5 mm/h (2.0mm 이상 -> 푸른 빗줄기 파티클 ON, 우비 개구리)
 * - 제주특별자치도 / 부산광역시: 0.0 mm/h (맑음 -> 비 파티클 OFF, 선글라스 개구리)
 * - 인천광역시: 1.5 mm/h (2.0mm 미만 -> 비 파티클 OFF, 구름 모자 개구리)
 * ==========================================================================
 */

// 지역별 명확한 내부 날씨 예보 데이터베이스
const LOCAL_WEATHER_DATABASE = {
    seoul: { name: '서울특별시 🏙️', rain: 8.5, status: 'drizzle' },
    jeju: { name: '제주특별자치도 🌴', rain: 0.0, status: 'sunny' },
    busan: { name: '부산광역시 🌊', rain: 0.0, status: 'sunny' },
    incheon: { name: '인천광역시 ✈️', rain: 1.5, status: 'cloudy' },
    gangneung: { name: '강원도 강릉 🌲', rain: 5.0, status: 'snow' },
    dokdo: { name: '독도 / 울릉도 🏝️', rain: 22.0, status: 'heavy_rain' }
};

/**
 * 선택한 지역의 날씨 예보를 메인 대시보드(app.js)로 연동하는 함수
 * @param {string} cityKey - 'seoul' | 'jeju' | 'busan' | 'incheon' | 'gangneung' | 'dokdo'
 */
function fetchRealtimeWeather(cityKey = 'seoul') {
    const city = LOCAL_WEATHER_DATABASE[cityKey] || LOCAL_WEATHER_DATABASE.seoul;
    
    console.log(`[WeatherApp] ${city.name} 선택 - 강수량: ${city.rain} mm/h`);

    // 상단 상태 안내 문구 업데이트
    const apiNoticeText = document.getElementById('apiNoticeText');
    if (apiNoticeText) {
        if (city.rain >= 2.0) {
            apiNoticeText.textContent = `🌧️ ${city.name}: 강수량 ${city.rain} mm/h (2.0mm 이상 -> 푸른 빗줄기 파티클 ON)`;
        } else if (city.rain > 0) {
            apiNoticeText.textContent = `☁️ ${city.name}: 강수량 ${city.rain} mm/h (2.0mm 미만 -> 비 파티클 OFF)`;
        } else {
            apiNoticeText.textContent = `☀️ ${city.name}: 강수량 0.0 mm/h (맑음 -> 비 파티클 OFF)`;
        }
    }

    // 메인 대시보드(app.js)로 데이터 즉시 연동
    if (typeof window.setWeatherData === 'function') {
        window.setWeatherData({
            rain: city.rain,
            status: city.status,
            locationName: city.name
        });
    }
}
