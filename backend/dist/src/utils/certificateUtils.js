"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDynamicCertificateUrl = void 0;
const generateDynamicCertificateUrl = (studentName, courseTitle, date) => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dctih5vym';
    const templateId = process.env.CLOUDINARY_CERT_TEMPLATE_ID || 'learnit_courses/cert_template';
    const encodeCloudinaryText = (text) => encodeURIComponent(text).replace(/%/g, '%25');
    const encodedName = encodeCloudinaryText(studentName);
    const encodedCourse = encodeCloudinaryText(courseTitle);
    const encodedDate = encodeCloudinaryText(date);
    const transformations = [
        `l_text:Arial_60_bold:${encodedName},y_-50`,
        `l_text:Arial_40:${encodedCourse},y_50`,
        `l_text:Arial_30:${encodedDate},y_150`
    ].join('/');
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${templateId}.jpg`;
};
exports.generateDynamicCertificateUrl = generateDynamicCertificateUrl;
