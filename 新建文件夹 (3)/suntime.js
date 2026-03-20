/**
 * 计算真太阳时
 * @param {number} year - 年
 * @param {number} month - 月
 * @param {number} day - 日
 * @param {number} hour - 时（北京时间）
 * @param {number} minute - 分（北京时间）
 * @param {number} longitude - 当地经度
 * @returns {object} 包含修正后的年月日时分
 */
function calculateTrueSolarTime(year, month, day, hour, minute, longitude) {
    // 1. 计算时区差（每度4分钟）
    const timeDiff = (120 - longitude) * 4; // 单位：分钟
    
    // 2. 北京时间转成总分钟数
    let totalMinutes = hour * 60 + minute;
    
    // 3. 减去时区差（东加西减：经度小于120°要减）
    totalMinutes = totalMinutes - timeDiff;
    
    // 4. 处理跨日情况
    let newDay = day;
    let newHour = Math.floor(totalMinutes / 60);
    let newMinute = Math.floor(totalMinutes % 60);
    
    // 如果小时<0，表示到了前一天
    while (newHour < 0) {
        newHour += 24;
        newDay -= 1;
    }
    // 如果小时>=24，表示到了后一天
    while (newHour >= 24) {
        newHour -= 24;
        newDay += 1;
    }
    
    // 5. 跨月/跨年的简单处理（这里简化，lunar.js会处理复杂情况）
    // 注意：真正精确的需要用日期库，但lunar.fromYmdHms会自动处理
    
    return {
        year: year,
        month: month,
        day: newDay,
        hour: newHour,
        minute: newMinute
    };
}