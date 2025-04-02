const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();

// 添加详细的日志中间件
app.use((req, res, next) => {
    const beijingTime = new Date(new Date().getTime() + 8 * 60 * 60 * 1000);
    console.log(`[${beijingTime.toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use(cors());
app.use(express.json());

// 保存预测数据到log.csv
app.post('/save-prediction', (req, res) => {
    try {
        const beijingTime = new Date(new Date().getTime() + 8 * 60 * 60 * 1000);
        console.log('Received prediction data:', req.body);
        const prediction = req.body;
        const headers = ["时间戳", "大学名称", "语言考试类型", "语言成绩", "GPA", "课程体系", "课程数量", "平均课程成绩", "预测录取率"];
        const csvLine = "\n" + [
            beijingTime.toISOString(), // 使用北京时间
            prediction.university,
            prediction.languageTest,
            prediction.languageScore,
            prediction.gpa,
            prediction.curriculum,
            prediction.courseCount,
            prediction.avgCourseScore,
            prediction.probability.toFixed(2) + "%"
        ].join(",");

        console.log('Writing to log.csv:', csvLine);

        // 检查文件是否存在，不存在则创建并添加表头
        if (!fs.existsSync('log.csv')) {
            console.log('Creating new log.csv file');
            fs.writeFileSync('log.csv', headers.join(","));
        }

        // 追加新数据
        fs.appendFileSync('log.csv', csvLine);
        console.log('Successfully saved to log.csv');
        res.send({ status: "success", message: "Prediction saved successfully" });
    } catch (error) {
        console.error('Error saving prediction:', error);
        res.status(500).send({ status: "error", message: "Failed to save prediction" });
    }
});

// 获取所有预测数据
app.get('/get-predictions', (req, res) => {
    try {
        if (fs.existsSync('log.csv')) {
            const data = fs.readFileSync('log.csv', 'utf8');
            console.log('Current log.csv content:', data);
            res.send({ status: "success", data: data });
        } else {
            console.log('log.csv does not exist');
            res.send({ status: "success", data: "" });
        }
    } catch (error) {
        console.error('Error reading predictions:', error);
        res.status(500).send({ status: "error", message: "Failed to read predictions" });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    const beijingTime = new Date(new Date().getTime() + 8 * 60 * 60 * 1000);
    console.log(`Server is running on port ${PORT}`);
    console.log('Server started at:', beijingTime.toISOString());
}); 