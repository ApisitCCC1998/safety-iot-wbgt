const translations = {
  en: {
    // App
    appTitle: 'Safety & IoT Dashboard',
    appSubtitle: 'Heat Stress Monitoring System',

    // Header controls
    playStream: 'Play Stream',
    pauseStream: 'Pause Stream',
    connected: 'Connected',
    disconnected: 'Disconnected',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',

    // Metric cards
    wbgtIndex: 'WBGT Index',
    ambientTemp: 'Ambient Temp',
    relativeHumidity: 'Relative Humidity',
    globeTemp: 'Globe Temp',

    // Weather widget
    outdoorWeather: 'Outdoor Weather',
    refreshWeather: 'Refresh Weather',
    feelsLike: 'Feels Like',
    windSpeed: 'Wind Speed',
    uvIndex: 'UV Index',
    weatherError: 'Unable to load weather data.',
    retry: 'Retry',

    // Alert banner
    dangerAlert: '⚠ HIGH DANGER — WBGT exceeds 32.5°C! Stop or severely limit heavy outdoor work immediately.',

    // Work-Rest Advisory
    workRestAdvisory: 'Work-Rest Advisory (ACGIH)',
    continuousWork: 'Continuous Work',
    workRatio: 'Work / Rest Ratio',
    currentStatus: 'Current Status',
    work: 'Work',
    rest: 'Rest',

    // WBGT Tiers
    safe: 'Safe',
    caution: 'Caution',
    warning: 'Warning',
    danger: 'High Danger',
    safePct: 'Continuous Work (100%)',
    cautionPct: 'Work 75% / Rest 25%',
    warningPct: 'Work 50% / Rest 50%',
    dangerPct: 'Work 25% / Rest 75%',

    // Charts
    wbgtTrend: 'WBGT 24-Hour Trend',
    wbgtValue: 'WBGT (°C)',
    thresholdLine: 'Threshold (30°C)',
    incidentBreakdown: 'Incident Breakdown by Category',
    exportSensorLog: 'Export Sensor Log (CSV)',
    clearLog: 'Clear Log',
    confirmClearLog: 'Are you sure you want to clear historical sensor log data for a fresh testing session?',
    loggedPoints: 'Logged',
    points: 'points',

    // Incident categories
    heatStress: 'Heat Stress',
    slipFall: 'Slip / Fall',
    chemical: 'Chemical',
    electrical: 'Electrical',
    ergonomic: 'Ergonomic',

    // KPIs
    daysWithoutLTI: 'Days Without LTI',
    activeHazards: 'Active Hazards',

    // Hazard table
    hazardRegister: 'Hazard & Incident Register',
    reportHazard: 'Report New Hazard',
    exportCSV: 'Export CSV',
    id: 'ID',
    timestamp: 'Timestamp',
    area: 'Area',
    category: 'Category',
    severity: 'Severity',
    status: 'Status',

    // Status values
    open: 'Open',
    inProgress: 'In Progress',
    closed: 'Closed',

    // Severity values
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',

    // Modal
    modalTitle: 'Report New Hazard',
    modalArea: 'Work Area',
    modalAreaPlaceholder: 'e.g. Assembly Line A, Rooftop, Boiler Room',
    modalCategory: 'Category',
    modalSeverity: 'Severity',
    modalDescription: 'Description',
    modalDescPlaceholder: 'Describe the hazard or incident...',
    submit: 'Submit Report',
    cancel: 'Cancel',

    // Footer
    lastUpdated: 'Last updated',
    source: 'Source',
    mock: 'Mock Simulator',
    esp32: 'ESP32 Hardware',
  },
  th: {
    appTitle: 'แดชบอร์ดความปลอดภัย & IoT',
    appSubtitle: 'ระบบติดตามความเครียดจากความร้อน',

    playStream: 'เล่นสตรีม',
    pauseStream: 'หยุดสตรีม',
    connected: 'เชื่อมต่อแล้ว',
    disconnected: 'ไม่ได้เชื่อมต่อ',
    lightMode: 'โหมดสว่าง',
    darkMode: 'โหมดมืด',

    wbgtIndex: 'ค่าดัชนี WBGT',
    ambientTemp: 'อุณหภูมิโดยรอบ',
    relativeHumidity: 'ความชื้นสัมพัทธ์',
    globeTemp: 'อุณหภูมิลูกโลก',

    // Weather widget
    outdoorWeather: 'สภาพอากาศภายนอก',
    refreshWeather: 'รีเฟรชสภาพอากาศ',
    feelsLike: 'รู้สึกเหมือน',
    windSpeed: 'ความเร็วลม',
    uvIndex: 'ดัชนี UV',
    weatherError: 'ไม่สามารถโหลดข้อมูลอากาศได้',
    retry: 'ลองใหม่',

    dangerAlert: '⚠ อันตรายสูง — WBGT เกิน 32.5°C! หยุดหรือจำกัดการทำงานหนักกลางแจ้งโดยทันที',

    workRestAdvisory: 'คำแนะนำการทำงาน-พักผ่อน (ACGIH)',
    continuousWork: 'ทำงานต่อเนื่อง',
    workRatio: 'อัตราทำงาน / พักผ่อน',
    currentStatus: 'สถานะปัจจุบัน',
    work: 'ทำงาน',
    rest: 'พักผ่อน',

    safe: 'ปลอดภัย',
    caution: 'ระวัง',
    warning: 'เตือน',
    danger: 'อันตรายสูง',
    safePct: 'ทำงานต่อเนื่อง (100%)',
    cautionPct: 'ทำงาน 75% / พัก 25%',
    warningPct: 'ทำงาน 50% / พัก 50%',
    dangerPct: 'ทำงาน 25% / พัก 75%',

    wbgtTrend: 'แนวโน้ม WBGT 24 ชั่วโมง',
    wbgtValue: 'WBGT (°C)',
    thresholdLine: 'เกณฑ์ (30°C)',
    incidentBreakdown: 'สรุปอุบัติเหตุตามประเภท',
    exportSensorLog: 'ส่งออกบันทึกเซนเซอร์ (CSV)',
    clearLog: 'ล้างบันทึก',
    confirmClearLog: 'คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลบันทึกเซนเซอร์เพื่อเริ่มรอบการทดสอบใหม่?',
    loggedPoints: 'บันทึกแล้ว',
    points: 'จุด',

    heatStress: 'ความเครียดจากความร้อน',
    slipFall: 'ลื่น / ตก',
    chemical: 'สารเคมี',
    electrical: 'ไฟฟ้า',
    ergonomic: 'การยศาสตร์',

    daysWithoutLTI: 'วันที่ไม่มีการบาดเจ็บหายไปจากงาน',
    activeHazards: 'อันตรายที่ยังเปิดอยู่',

    hazardRegister: 'ทะเบียนอันตรายและเหตุการณ์',
    reportHazard: 'รายงานอันตรายใหม่',
    exportCSV: 'ส่งออก CSV',
    id: 'รหัส',
    timestamp: 'วันที่/เวลา',
    area: 'พื้นที่',
    category: 'ประเภท',
    severity: 'ความรุนแรง',
    status: 'สถานะ',

    open: 'เปิด',
    inProgress: 'กำลังดำเนินการ',
    closed: 'ปิด',

    critical: 'วิกฤต',
    high: 'สูง',
    medium: 'ปานกลาง',
    low: 'ต่ำ',

    modalTitle: 'รายงานอันตรายใหม่',
    modalArea: 'พื้นที่ทำงาน',
    modalAreaPlaceholder: 'เช่น สายการประกอบ A, ดาดฟ้า, ห้องหม้อไอน้ำ',
    modalCategory: 'ประเภท',
    modalSeverity: 'ความรุนแรง',
    modalDescription: 'คำอธิบาย',
    modalDescPlaceholder: 'อธิบายอันตรายหรือเหตุการณ์...',
    submit: 'ส่งรายงาน',
    cancel: 'ยกเลิก',

    lastUpdated: 'อัปเดตล่าสุด',
    source: 'แหล่งข้อมูล',
    mock: 'จำลองข้อมูล',
    esp32: 'ฮาร์ดแวร์ ESP32',
  },
}

export default translations
