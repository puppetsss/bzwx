// ==================== 初始化下拉选项 ====================
function initSelectors() {
    // 年份 (1900-2026)
    const yearSelect = document.getElementById('year');
    yearSelect.innerHTML = '<option value="">年</option>';
    for (let y = 2026; y >= 1900; y--) {
        const option = document.createElement('option');
        option.value = y;
        option.textContent = y;
        yearSelect.appendChild(option);
    }
    
    // 月份
    const monthSelect = document.getElementById('month');
    monthSelect.innerHTML = '<option value="">月</option>';
    for (let m = 1; m <= 12; m++) {
        const option = document.createElement('option');
        option.value = m;
        option.textContent = m;
        monthSelect.appendChild(option);
    }
    
    // 日期
    const daySelect = document.getElementById('day');
    daySelect.innerHTML = '<option value="">日</option>';
    for (let d = 1; d <= 31; d++) {
        const option = document.createElement('option');
        option.value = d;
        option.textContent = d;
        daySelect.appendChild(option);
    }
    
    // 小时
    const hourSelect = document.getElementById('hour');
    hourSelect.innerHTML = '<option value="">时</option>';
    for (let h = 0; h <= 23; h++) {
        const option = document.createElement('option');
        option.value = h;
        option.textContent = h;
        hourSelect.appendChild(option);
    }
    
    // 分钟
    const minuteSelect = document.getElementById('minute');
    minuteSelect.innerHTML = '<option value="">分</option>';
    for (let m = 0; m <= 59; m++) {
        const option = document.createElement('option');
        option.value = m;
        option.textContent = m;
        minuteSelect.appendChild(option);
    }

    // 省份初始化
    const provinceSelect = document.getElementById('province');
    provinceSelect.innerHTML = '<option value="">请选择省份</option>';
    for (let province in window.cityData) {
        const option = document.createElement('option');
        option.value = province;
        option.textContent = province;
        provinceSelect.appendChild(option);
    }

    // 城市和区县初始状态
    const citySelect = document.getElementById('city');
    const districtSelect = document.getElementById('district');
    if (citySelect) {
        citySelect.innerHTML = '<option value="">请先选择省份</option>';
        citySelect.disabled = true;
    }
    if (districtSelect) {
        districtSelect.innerHTML = '<option value="">请先选择城市</option>';
        districtSelect.disabled = true;
    }
}

// ==================== 省市区联动 ====================
function initCityLinkage() {
    const provinceSelect = document.getElementById('province');
    const citySelect = document.getElementById('city');
    const districtSelect = document.getElementById('district');

    if (!provinceSelect || !citySelect || !districtSelect) return;

    provinceSelect.addEventListener('change', function() {
        const province = this.value;
        citySelect.innerHTML = '<option value="">请选择城市</option>';
        districtSelect.innerHTML = '<option value="">请选择区县</option>';
        
        if (!province) {
            citySelect.disabled = true;
            districtSelect.disabled = true;
            return;
        }
        
        citySelect.disabled = false;
        const cities = window.cityData[province];
        for (let city in cities) {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        }
    });

    citySelect.addEventListener('change', function() {
        const province = provinceSelect.value;
        const city = this.value;
        districtSelect.innerHTML = '<option value="">请选择区县</option>';
        
        if (!city) {
            districtSelect.disabled = true;
            return;
        }
        
        districtSelect.disabled = false;
        const districts = window.cityData[province][city];
        for (let district of districts) {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtSelect.appendChild(option);
        }
    });
}

// ==================== 获取经度（按省份）====================
function getLongitudeByProvince(province) {
    const map = {
        "北京市": 116.40, "上海市": 121.47, "天津市": 117.20, "重庆市": 106.55,
        "广东省": 113.26, "江苏省": 118.78, "浙江省": 120.15, "四川省": 104.06,
        "湖北省": 114.30, "陕西省": 108.95, "黑龙江省": 126.63, "吉林省": 125.35,
        "辽宁省": 123.43, "山东省": 117.00, "山西省": 112.56, "河南省": 113.65,
        "河北省": 114.48, "湖南省": 112.94, "江西省": 115.85, "安徽省": 117.27,
        "福建省": 119.30, "广西壮族自治区": 108.33, "贵州省": 106.71, "云南省": 102.73,
        "西藏自治区": 91.11, "新疆维吾尔自治区": 87.68, "青海省": 101.74, "甘肃省": 103.73,
        "宁夏回族自治区": 106.27, "海南省": 110.35, "香港特别行政区": 114.17,
        "澳门特别行政区": 113.54, "台湾省": 121.52
    };
    return map[province] || 120.0;
}

// ==================== 真太阳时计算 ====================
function calculateTrueSolarTime(year, month, day, hour, minute, longitude) {
    const timeDiff = (120 - longitude) * 4;
    let totalMinutes = hour * 60 + minute - timeDiff;
    totalMinutes = Math.round(totalMinutes);
    
    let newDay = day;
    let newHour = Math.floor(totalMinutes / 60);
    let newMinute = totalMinutes % 60;
    
    if (newMinute < 0) {
        newMinute += 60;
        newHour -= 1;
    }
    
    while (newMinute >= 60) {
        newMinute -= 60;
        newHour += 1;
    }
    
    while (newHour < 0) {
        newHour += 24;
        newDay -= 1;
    }
    while (newHour >= 24) {
        newHour -= 24;
        newDay += 1;
    }
    
    if (newDay < 1) newDay = 1;
    
    return { 
        year: year, 
        month: month, 
        day: newDay, 
        hour: newHour, 
        minute: newMinute 
    };
}

// ==================== 获取八字（兼容不同版本lunar.js）====================
function getBaziFromLunar(lunar) {
    let yearGanZhi, monthGanZhi, dayGanZhi, timeGanZhi;
    
    if (typeof lunar.getYearInGanZhi === 'function') {
        yearGanZhi = lunar.getYearInGanZhi();
        monthGanZhi = lunar.getMonthInGanZhi();
        dayGanZhi = lunar.getDayInGanZhi();
        timeGanZhi = lunar.getTimeInGanZhi();
    } else if (typeof lunar.getYearGanZhi === 'function') {
        yearGanZhi = lunar.getYearGanZhi();
        monthGanZhi = lunar.getMonthGanZhi();
        dayGanZhi = lunar.getDayGanZhi();
        timeGanZhi = lunar.getTimeGanZhi();
    } else if (lunar.getEightChar) {
        const eightChar = lunar.getEightChar();
        yearGanZhi = eightChar.getYear();
        monthGanZhi = eightChar.getMonth();
        dayGanZhi = eightChar.getDay();
        timeGanZhi = eightChar.getTime();
    } else {
        throw new Error('无法获取八字：不支持的lunar.js版本');
    }
    
    return `${yearGanZhi} ${monthGanZhi} ${dayGanZhi} ${timeGanZhi}`;
}

// ==================== 页面加载 ====================
window.onload = function() {
    initSelectors();
    initCityLinkage();

    document.getElementById('generateBtn').addEventListener('click', function() {
        if (typeof Solar === 'undefined') {
            alert('错误：lunar.js 未加载，请检查文件是否存在');
            return;
        }

        const apiKey = document.getElementById('apiKey').value.trim();
        if (!apiKey) {
            alert('请输入API密钥');
            return;
        }

        const userName = document.getElementById('userName').value.trim();
        if (!userName) {
            alert('请输入你的姓名');
            return;
        }

        const yearStr = document.getElementById('year').value;
        const monthStr = document.getElementById('month').value;
        const dayStr = document.getElementById('day').value;
        const hourStr = document.getElementById('hour').value;
        const minuteStr = document.getElementById('minute').value;
        
        if (!yearStr || !monthStr || !dayStr || !hourStr || !minuteStr) {
            alert('请填写完整的出生时间');
            return;
        }
        
        const year = parseInt(yearStr);
        const month = parseInt(monthStr);
        const day = parseInt(dayStr);
        const hour = parseInt(hourStr);
        const minute = parseInt(minuteStr);
        const gender = document.getElementById('gender').value;
        const province = document.getElementById('province').value;
        const city = document.getElementById('city').value;
        const district = document.getElementById('district').value;

        if (year < 1900 || year > 2100) {
            alert('年份必须在1900-2100之间');
            return;
        }
        if (month < 1 || month > 12) {
            alert('月份必须在1-12之间');
            return;
        }
        if (day < 1 || day > 31) {
            alert('日期必须在1-31之间');
            return;
        }
        if (hour < 0 || hour > 23) {
            alert('小时必须在0-23之间');
            return;
        }
        if (minute < 0 || minute > 59) {
            alert('分钟必须在0-59之间');
            return;
        }
        
        if (!province || !city || !district) {
            alert('请选择完整的出生地（省市区）');
            return;
        }

        try {
            const longitude = getLongitudeByProvince(province);
            const trueTime = calculateTrueSolarTime(
                year, month, day, hour, minute, longitude
            );
            
            const solar = Solar.fromYmdHms(
                trueTime.year, trueTime.month, trueTime.day,
                trueTime.hour, trueTime.minute, 0
            );
            
            if (!solar) {
                throw new Error('lunar.js排盘失败');
            }
            
            const lunar = solar.getLunar();
            if (!lunar) {
                throw new Error('获取农历失败');
            }
            
            const bazi = getBaziFromLunar(lunar);

            const params = new URLSearchParams({
                apiKey: apiKey,
                userName: userName,
                bazi: bazi,
                gender: gender,
                province: province,
                city: city,
                district: district,
                year: year,
                month: month,
                day: day,
                hour: hour,
                minute: minute,
                trueYear: trueTime.year,
                trueMonth: trueTime.month,
                trueDay: trueTime.day,
                trueHour: trueTime.hour,
                trueMinute: trueTime.minute
            });

            window.location.href = `result.html?${params.toString()}`;
            
        } catch (error) {
            alert('排盘出错：' + error.message);
            console.error('详细错误信息：', error);
        }
    });
};