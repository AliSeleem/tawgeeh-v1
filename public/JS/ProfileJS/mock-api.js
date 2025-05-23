const dummyData = {
  certifications: {
    success: true,
    message: "Certificates retrieved successfully.",
    data: [
      {
        id: 1,
        userId: 4,
        name: "React Developer Certification",
        donor: "Coursera",
        date: "2025-01-15T00:00:00.000Z",
        expireAt: "2026-01-15T00:00:00.000Z",
        number: "CERT123456",
        link: "https://coursera.org/certificate/react123",
        createdAt: "2025-05-21T14:26:23.699Z",
        updatedAt: "2025-05-21T14:26:23.699Z"
      },
      {
        id: 2,
        userId: 4,
        name: "AWS Certified Solutions Architect",
        donor: "Amazon Web Services",
        date: "2024-11-10T00:00:00.000Z",
        expireAt: "2027-11-10T00:00:00.000Z",
        number: "AWS987654",
        link: "https://aws.amazon.com/certification",
        createdAt: "2025-05-21T14:26:23.699Z",
        updatedAt: "2025-05-21T14:26:23.699Z"
      },
      {
        id: 3,
        userId: 4,
        name: "Python for Data Science",
        donor: "IBM",
        date: "2024-09-01T00:00:00.000Z",
        expireAt: null,
        number: "PY123789",
        link: null,
        createdAt: "2025-05-21T14:26:23.699Z",
        updatedAt: "2025-05-21T14:26:23.699Z"
      },
      {
        id: 4,
        userId: 4,
        name: "Full Stack Web Development",
        donor: "Udemy",
        date: "2024-06-20T00:00:00.000Z",
        expireAt: null,
        number: "UD456123",
        link: "https://udemy.com/certificate/fullstack",
        createdAt: "2025-05-21T14:26:23.699Z",
        updatedAt: "2025-05-21T14:26:23.699Z"
      }
    ]
  },
  experiences: {
    success: true,
    message: "Experiences retrieved successfully.",
    data: [
      {
        id: 1,
        userId: 4,
        title: "Senior Frontend Developer",
        companyName: "TechCorp",
        startDate: "2023-03-01T00:00:00.000Z",
        endDate: null,
        description: "Led a team of developers to build scalable web applications using React and TypeScript.",
        createdAt: "2025-05-21T14:26:23.699Z",
        updatedAt: "2025-05-21T14:26:23.699Z"
      },
      {
        id: 2,
        userId: 4,
        title: "Software Engineer",
        companyName: "Innovate Solutions",
        startDate: "2021-06-15T00:00:00.000Z",
        endDate: "2023-02-28T00:00:00.000Z",
        description: "Developed backend services using Node.js and MongoDB.",
        createdAt: "2025-05-21T14:26:23.699Z",
        updatedAt: "2025-05-21T14:26:23.699Z"
      }
    ]
  },
  education: {
    success: true,
    message: "Education retrieved successfully.",
    data: [
      {
        id: 1,
        userId: 4,
        degree: "Bachelor of Science",
        institution: "Cairo University",
        field: "Computer Science",
        startDate: "2017-09-01T00:00:00.000Z",
        endDate: "2021-06-30T00:00:00.000Z",
        createdAt: "2025-05-21T14:26:23.699Z",
        updatedAt: "2025-05-21T14:26:23.699Z"
      },
      {
        id: 2,
        userId: 4,
        degree: "Master of Science",
        institution: "American University in Cairo",
        field: "Software Engineering",
        startDate: "2021-09-01T00:00:00.000Z",
        endDate: "2023-06-30T00:00:00.000Z",
        createdAt: "2025-05-21T14:26:23.699Z",
        updatedAt: "2025-05-21T14:26:23.699Z"
      }
    ]
  },
  ratings: {
    success: true,
    message: "Ratings retrieved successfully.",
    data: [
      {
        id: 1,
        userId: 4,
        reviewerName: "Ahmed Ali",
        comment: "Excellent mentor, very knowledgeable in React and JavaScript!",
        rating: 4.5,
        menteeImage: "https://example.com/ahmed.jpg",
        createdAt: "2025-04-10T14:26:23.699Z",
        updatedAt: "2025-05-21T14:26:23.699Z",
        liked: true
      },
      {
        id: 2,
        userId: 4,
        reviewerName: "Sara Mohamed",
        comment: "Helped me understand complex concepts with ease.",
        rating: 5.0,
        menteeImage: null,
        createdAt: "2025-03-15T14:26:23.699Z",
        updatedAt: "2025-05-21T14:26:23.699Z",
        liked: false
      }
    ]
  },
  achievements: {
    success: true,
    message: "Achievements retrieved successfully.",
    data: [
      {
        id: 1,
        userId: 4,
        title: "Top Mentor Award",
        description: "Received for outstanding mentorship in 2024.",
        date: "2024-12-01T00:00:00.000Z",
        icon: "https://example.com/top-mentor-icon.png",
        unlocked: true,
        progress: 100,
        createdAt: "2025-05-21T14:26:23.699Z",
        updatedAt: "2025-05-21T14:26:23.699Z"
      },
      {
        id: 2,
        userId: 4,
        title: "50 Sessions Milestone",
        description: "Completed 50 mentoring sessions.",
        date: null,
        icon: null,
        unlocked: false,
        progress: 80,
        createdAt: "2025-05-21T14:26:23.699Z",
        updatedAt: "2025-05-21T14:26:23.699Z"
      }
    ]
  }
};

const api = {
  baseUrl: "https://tawgeeh-v1-production.up.railway.app",

  async getCertifications(userId, token) {
    return dummyData.certifications.data;
  },

  async getEntities(entity, userId, token) {
    return dummyData[entity]?.data || [];
  },

  // Mock other required functions to avoid errors
  async getCertification(userId, id, token) {
    return dummyData.certifications.data.find(item => item.id === parseInt(id));
  },

  async deleteCertification(id, token) {
    dummyData.certifications.data = dummyData.certifications.data.filter(item => item.id !== parseInt(id));
    return { success: true };
  },

  async deleteEntity(entity, id, token) {
    dummyData[entity].data = dummyData[entity].data.filter(item => item.id !== parseInt(id));
    return { success: true };
  },

  async likeRating(id, token) {
    const rating = dummyData.ratings.data.find(item => item.id === parseInt(id));
    if (rating) rating.liked = !rating.liked;
    return { success: true };
  }
};

// Mock window.auth and common objects to avoid undefined errors
window.auth = {
  handleApiError: async (response) => {
    if (!response.ok) throw new Error("Mock API error");
  }
};

const common = {
  decodeJWT: (token) => ({ sub: 4 }), // Mock userId
  showAlert: (title, message, type) => console.log(`${type}: ${title} - ${message}`)
};