import { Request } from 'express';

/**
 * Ensures that course assets (thumbnail, lesson videos) have full URLs
 * if they are stored locally.
 */
export const formatCourseURLs = (course: any, req: Request) => {
     if (!course) return course;

     const protocol = req.protocol;
     const host = req.get('host');
     const baseUrl = `${protocol}://${host}`;

     const formattedCourse = { ...course };

     if (formattedCourse.thumbnailUrl && formattedCourse.thumbnailUrl.startsWith('/uploads')) {
          formattedCourse.thumbnailUrl = `${baseUrl}${formattedCourse.thumbnailUrl}`;
     }

     if (formattedCourse.lessons) {
          formattedCourse.lessons = formattedCourse.lessons.map((lesson: any) => {
               const formattedLesson = { ...lesson };
               if (formattedLesson.videoUrl && formattedLesson.videoUrl.startsWith('/uploads')) {
                    formattedLesson.videoUrl = `${baseUrl}${formattedLesson.videoUrl}`;
               }
               return formattedLesson;
          });
     }

     return formattedCourse;
};
