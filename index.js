/*
LUCAS DANIEL MONTVIERO Tp3 GraphQL APi

1 - Create 3 JSON files with Course, Student and Grade
2 - Course have an id, name and description
3 - Student have id, name, lastname, courseId (Assumption: 1 student only can be in one course)
4 - Grade have id, courseId, studentId, grade

Create a Graphql structure in order to:

1 - Query all Courses, Students and Grades
1 - Query by id a Course, Student and Grade
2 - Create a Course, Student and Grade
2 - Delete a Course, Student and Grade

*/

const express = require("express");
const app = express();
const expressGraphQL = require("express-graphql");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt,
} = require("graphql");
const _ = require("lodash");

const Courses = require("./courses.json");
const Students = require("./students.json");
const Grades = require("./grades.json");

// ---
// Definicion de los GraphQL Object Type

const CourseType = new GraphQLObjectType({
  name: "Course",
  description: "Represent Course",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    description: { type: GraphQLNonNull(GraphQLString) },
    students: {
      type: new GraphQLList(StudentType),
      resolve: (course) => {
        return Students.filter((student) => course.id === student.courseId);
      },
    },
    grade: {
      type: new GraphQLList(GradeType),
      resolve: (course) => {
        return Grades.filter((grade) => course.id === grade.courseId);
      },
    },
  }),
});

const StudentType = new GraphQLObjectType({
  name: "Student",
  description: "Represent Student",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    lastname: { type: GraphQLNonNull(GraphQLString) },
    courseId: { type: GraphQLNonNull(GraphQLInt) },
    // course: {
    //   type: CourseType,
    //   resolve: (student) => {
    //     return ( Courses.find((course) => {
    //       course.id === student.courseId;
    //     }));
    //   }
    // }
    course: {
      type: CourseType,
      resolve: (student) => {
        return Courses.find((course) => course.id === student.courseId);
      },
    }, // idk what happens here
    grade: {
      type: new GraphQLList(GradeType),
      resolve: (student) => {
        return Grades.filter((grade) => student.id === grade.studentId);
      },
    },
  }),
});

const GradeType = new GraphQLObjectType({
  name: "Grade",
  description: "Represent Grade",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    courseId: { type: GraphQLNonNull(GraphQLInt) },
    studentId: { type: GraphQLNonNull(GraphQLInt) },
    grade: { type: GraphQLNonNull(GraphQLInt) },
    course: {
      type: CourseType,
      resolve: (grade) => {
        return Courses.find((course) => course.id === grade.courseId);
      },
    },
    student: {
      type: StudentType,
      resolve: (grade) => {
        return Students.find((student) => student.id === grade.studentId);
      },
    },
  }),
});

// ---
// Definicion de Querys
const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    // --- Alls
    courses: {
      type: new GraphQLList(CourseType),
      description: "List of All Courses",
      resolve: () => Courses,
    },
    stuents: {
      type: new GraphQLList(StudentType),
      description: "List of All Students",
      resolve: () => Students,
    },
    grades: {
      type: new GraphQLList(GradeType),
      description: "List of All Grades",
      resolve: () => Grades,
    },
    // --- Particulars
    course: {
      type: CourseType,
      description: "Particular Course",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) =>
        Courses.find((course) => course.id === args.id),
    },
    stuent: {
      type: StudentType,
      description: "Particular Stuent",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) =>
        Students.find((stuent) => stuent.id === args.id),
    },
    grade: {
      type: GradeType,
      description: "Particular Grade",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => Grades.find((grade) => grade.id === args.id),
    },
  }),
});

// ---
// Mutations
const RootMutationType = new GraphQLObjectType({
  name: "Mutation",
  description: "Root Mutation",
  fields: () => ({
    // Add ---
    addCourse: {
      type: CourseType,
      description: "Add a Course",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const course = {
          id: Courses.length + 1,
          name: args.name,
          description: args.description,
        };
        Courses.push(course);
        return course;
      },
    },
    addStudent: {
      type: StudentType,
      description: "Add a Student",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        lastname: { type: GraphQLNonNull(GraphQLString) },
        courseId: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args) => {
        const student = {
          id: Students.length + 1,
          name: args.name,
          lastname: args.lastname,
          courseId: args.courseId,
        };
        Students.push(student);
        return student;
      },
    },
    addGrade: {
      type: GradeType,
      description: "Add a Grade",
      args: {
        courseId: { type: GraphQLNonNull(GraphQLInt) },
        studentId: { type: GraphQLNonNull(GraphQLInt) },
        grade: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args) => {
        const grade = {
          id: Grades.length + 1,
          courseId: args.courseId,
          studentId: args.studentId,
          grade: args.grade,
        };
        Grades.push(grade);
        return grade;
      },
    },
    // Delete ---
    deleteCourse: {
      type: CourseType,
      description: "Delete a Course",
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args) => {
        const courseDeleted = _.remove(Courses, (course) => {
          return (course.id === args.id);
        });
        // console.log( courseDeleted[0] );
        return (courseDeleted[0]);
      }
    },
    deleteStudent: {
      type: StudentType,
      description: "Delete a Student",
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args) => {
        const studentDeleted = _.remove(Students, (student) => {
          return (student.id === args.id);
        });
        // console.log( studentDeleted[0] );
        return (studentDeleted[0]);
      }
    },
    deleteGrade: {
      type: GradeType,
      description: "Delete a Graded",
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args) => {
        const gradeDeleted = _.remove(Grades, (grade) => {
          return (grade.id === args.id);
        });
        // console.log( gradeDeleted[0] );
        return (gradeDeleted[0]);
      }
    }
  }),
});

// ---

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

app.use(
  "/graphql",
  expressGraphQL({
    schema: schema,
    graphiql: true,
  })
);

app.listen(3000, () => {
  console.log("Server running on the port 3000 :)");
});

/* CONSULTAS GRAPHQL --- --- --- --- --- --- --- --- --- --- --- --- --- ---
Query all Courses:
query {
	courses {
    id
    name
    description
    students {
      id
      name
      lastname
      courseId
    }
  }
}
--- --- --- --- ---
Query a particular Courses:
query {
  course(id: 2) {
    id
    name
    description
    students {
      name
      lastname
      grade {
        grade
      }
    }
  }
}
--- --- --- --- --- --- --- --- --- ---
Query all Stuents:
query {
  stuents {
    id
    name
    lastname
    course {
      name
    }
    grade {
      grade
    }
  }
}
--- --- --- --- ---
Query a particular Stuents:
query {
  stuent(id: 1) {
    id
    name
    lastname
    course{
      name
      description
    }
    grade {
      grade
    }
  }
}
--- --- --- --- --- --- --- --- --- ---
Query all Grades:
query {
  grades{
    id
    course {
      name
    }
    student {
      name
      lastname
    }
    grade
  }
}
--- --- --- --- ---
Query a particular Grades:
query {
  grade(id: 3) {
    id
    courseId
    course {
      name
      description
    }
    studentId
    student{
      name
      lastname
    }
    grade
  }
}
--- --- --- --- --- --- --- --- --- ---
--- --- --- --- --- --- --- --- --- ---
Create Course:
mutation {
  addCourse(name: "Basic JS", description:"JS's description"){
    id
    name
    description
  }
}
--- --- --- --- ---
Delete Course:
mutation {
  deleteCourse(id: 1){
    id,
    name,
    description
  }
}

--- --- --- --- --- --- --- --- --- ---
Create Student:
mutation {
  addStudent(name: "Dario", lastname:"Sztajnszrajber", courseId: 2){
    id
    name
    lastname
    courseId
  }
}
--- --- --- --- ---
Delete Student:
mutation {
  deleteStudent(id: 1){
    id
    name
    lastname
  }
}
--- --- --- --- --- --- --- --- --- ---
Create Grade:
mutation {
  addGrade(courseId: 2, studentId: 6, grade: 3){
    id
    courseId
    course {
      id
    }
    studentId
	  student {
      name
      lastname
    }
    grade
  }
}
--- --- --- --- ---
Delete Grade:
mutation {
  deleteGrade(id: 3){
    id
    courseId
    course{
      name
    }
    studentId
    student{
      name
      lastname
    }
    grade
  }
}
*/
