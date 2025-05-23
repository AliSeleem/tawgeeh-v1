document.addEventListener("DOMContentLoaded", function () {
  // ================ التحقق من النموذج الأول (البيانات الأساسية) ================
  const specializationInput = document.getElementById("specialization");
  const experienceSelect = document.getElementById("experience");
  const genderSelect = document.getElementById("gender");
  const aboutMeTextarea = document.getElementById("about_me");

  // عناصر رسائل الخطأ للنموذج الأول
  const specializationError = document.getElementById("specializationError");
  const experienceError = document.getElementById("experienceError");
  const genderError = document.getElementById("genderError");
  const aboutMeError = document.getElementById("aboutMeError");

  // ================ التحقق من النموذج الثاني (الروابط الاجتماعية) ================
  const linkedinInput = document.getElementById("linkedin");
  const behanceInput = document.getElementById("behance");
  const githubInput = document.getElementById("github");
  const instagramInput = document.getElementById("instagram");
  const updateBtn = document.querySelector(".updateBtn");

  // عناصر رسائل الخطأ للروابط الاجتماعية
  const linkedinError = document.getElementById("linkedinError");
  const behanceError = document.getElementById("behanceError");
  const githubError = document.getElementById("githubError");
  const instagramError = document.getElementById("instagramError");

  // ================ دوال التحقق ================
  function validateSpecialization(specialization) {
    return specialization.trim() !== "";
  }

  function validateSelect(selectElement) {
    return selectElement.value !== "";
  }

  function validateAboutMe(aboutMe) {
    return aboutMe.trim().length >= 20; // على الأقل 20 حرف
  }

  function validateSocialLink(link, type) {
    if (link.trim() === "") return false; // الحقل مطلوب

    try {
      // التحقق من أن الرابط يبدأ بـ http أو https
      if (!/^https?:\/\//i.test(link)) {
        return false;
      }

      const url = new URL(link);
      const hostname = url.hostname.toLowerCase();

      // التحقق من أن الرابط ينتمي للموقع المطلوب
      switch (type) {
        case "linkedin":
          return hostname.includes("linkedin.com");
        case "behance":
          return (
            hostname.includes("behance.net") ||
            hostname.includes("dribbble.com")
          );
        case "github":
          return hostname.includes("github.com");
        case "instagram":
          return hostname.includes("instagram.com");
        default:
          return false;
      }
    } catch {
      return false;
    }
  }

  // ================ أحداث التحقق للنموذج الأول ================
  if (specializationInput) {
    specializationInput.addEventListener("input", function () {
      if (!validateSpecialization(this.value)) {
        specializationError.textContent = "يجب إدخال التخصص";
        this.classList.add("error-border");
      } else {
        specializationError.textContent = "";
        this.classList.remove("error-border");
      }
    });
  }

  if (experienceSelect) {
    experienceSelect.addEventListener("change", function () {
      if (!validateSelect(this)) {
        experienceError.textContent = "يجب اختيار سنوات الخبرة";
        this.classList.add("error-border");
      } else {
        experienceError.textContent = "";
        this.classList.remove("error-border");
      }
    });
  }

  if (genderSelect) {
    genderSelect.addEventListener("change", function () {
      if (!validateSelect(this)) {
        genderError.textContent = "يجب اختيار الجنس";
        this.classList.add("error-border");
      } else {
        genderError.textContent = "";
        this.classList.remove("error-border");
      }
    });
  }

  if (aboutMeTextarea) {
    aboutMeTextarea.addEventListener("input", function () {
      if (!validateAboutMe(this.value)) {
        aboutMeError.textContent = "يجب كتابة نبذة لا تقل عن 20 حرفاً";
        this.classList.add("error-border");
      } else {
        aboutMeError.textContent = "";
        this.classList.remove("error-border");
      }
    });
  }

  // ================ أحداث التحقق للنموذج الثاني ================
  if (linkedinInput) {
    linkedinInput.addEventListener("input", function () {
      if (this.value.trim() === "") {
        linkedinError.textContent = "حقل مطلوب";
        this.classList.add("error-border");
      } else if (!validateSocialLink(this.value, "linkedin")) {
        linkedinError.textContent =
          "يجب إدخال رابط Linkedin صحيح (مثال: https://linkedin.com/username)";
        this.classList.add("error-border");
      } else {
        linkedinError.textContent = "";
        this.classList.remove("error-border");
      }
    });
  }

  if (behanceInput) {
    behanceInput.addEventListener("input", function () {
      if (this.value.trim() === "") {
        behanceError.textContent = "حقل مطلوب";
        this.classList.add("error-border");
      } else if (!validateSocialLink(this.value, "behance")) {
        behanceError.textContent =
          "يجب إدخال رابط Behance أو Dribbble صحيح (مثال: https://behance.net/username)";
        this.classList.add("error-border");
      } else {
        behanceError.textContent = "";
        this.classList.remove("error-border");
      }
    });
  }

  if (githubInput) {
    githubInput.addEventListener("input", function () {
      if (this.value.trim() === "") {
        githubError.textContent = "حقل مطلوب";
        this.classList.add("error-border");
      } else if (!validateSocialLink(this.value, "github")) {
        githubError.textContent =
          "يجب إدخال رابط Github صحيح (مثال: https://github.com/username)";
        this.classList.add("error-border");
      } else {
        githubError.textContent = "";
        this.classList.remove("error-border");
      }
    });
  }

  if (instagramInput) {
    instagramInput.addEventListener("input", function () {
      if (this.value.trim() === "") {
        instagramError.textContent = "حقل مطلوب";
        this.classList.add("error-border");
      } else if (!validateSocialLink(this.value, "instagram")) {
        instagramError.textContent =
          "يجب إدخال رابط Instagram صحيح (مثال: https://instagram.com/username)";
        this.classList.add("error-border");
      } else {
        instagramError.textContent = "";
        this.classList.remove("error-border");
      }
    });
  }

  // ================ التحقق عند الإرسال ================
  if (updateBtn) {
    updateBtn.addEventListener("click", function (e) {
      let isValid = true;

      // التحقق من النموذج الأول
      if (!validateSpecialization(specializationInput.value)) {
        specializationError.textContent = "يجب إدخال التخصص";
        specializationInput.classList.add("error-border");
        isValid = false;
      }

      if (!validateSelect(experienceSelect)) {
        experienceError.textContent = "يجب اختيار سنوات الخبرة";
        experienceSelect.classList.add("error-border");
        isValid = false;
      }

      if (!validateSelect(genderSelect)) {
        genderError.textContent = "يجب اختيار الجنس";
        genderSelect.classList.add("error-border");
        isValid = false;
      }

      if (!validateAboutMe(aboutMeTextarea.value)) {
        aboutMeError.textContent = "يجب كتابة نبذة لا تقل عن 20 حرفاً";
        aboutMeTextarea.classList.add("error-border");
        isValid = false;
      }

      // التحقق من النموذج الثاني (الروابط الاجتماعية)
      if (linkedinInput.value.trim() === "") {
        linkedinError.textContent = "حقل مطلوب";
        linkedinInput.classList.add("error-border");
        isValid = false;
      } else if (!validateSocialLink(linkedinInput.value, "linkedin")) {
        linkedinError.textContent = "يجب إدخال رابط Linkedin صحيح";
        linkedinInput.classList.add("error-border");
        isValid = false;
      }

      if (behanceInput.value.trim() === "") {
        behanceError.textContent = "حقل مطلوب";
        behanceInput.classList.add("error-border");
        isValid = false;
      } else if (!validateSocialLink(behanceInput.value, "behance")) {
        behanceError.textContent = "يجب إدخال رابط Behance أو Dribbble صحيح";
        behanceInput.classList.add("error-border");
        isValid = false;
      }

      if (githubInput.value.trim() === "") {
        githubError.textContent = "حقل مطلوب";
        githubInput.classList.add("error-border");
        isValid = false;
      } else if (!validateSocialLink(githubInput.value, "github")) {
        githubError.textContent = "يجب إدخال رابط Github صحيح";
        githubInput.classList.add("error-border");
        isValid = false;
      }

      if (instagramInput.value.trim() === "") {
        instagramError.textContent = "حقل مطلوب";
        instagramInput.classList.add("error-border");
        isValid = false;
      } else if (!validateSocialLink(instagramInput.value, "instagram")) {
        instagramError.textContent = "يجب إدخال رابط Instagram صحيح";
        instagramInput.classList.add("error-border");
        isValid = false;
      }

      if (!isValid) {
        e.preventDefault();
        // الانتقال إلى أول حقل به خطأ
        const firstError = document.querySelector(".error-border");
        if (firstError) {
          firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } else {
        // النماذج صالحة، يمكنك إرسال البيانات
        alert("تم التحقق بنجاح، جاهز للإرسال!");
        // يمكنك إضافة كود الإرسال الفعلي هنا
      }
    });
  }
});
function checkInputDirection(input) {
  const text = input.value;
  const isArabic =
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
      text
    ) || /[0-9]/.test(text);

  if (isArabic) {
    input.style.direction = "rtl";
    input.style.textAlign = "right"; // لجعل النص يبدأ من اليمين
  } else {
    input.style.direction = "ltr";
    input.style.textAlign = "left"; // لجعل النص يبدأ من اليسار
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // عناصر النموذج
  const experienceForm = document.getElementById("experienceForm");
  const jobTitleInput = document.getElementById("jobTitle");
  const companyNameInput = document.getElementById("companyName");
  // const startDateInput = document.getElementById('startDate');
  // const endDateInput = document.getElementById('endDate');
  const stillWorkingCheckbox = document.getElementById("stillWorking");
  const contributionTextarea = document.getElementById("contribution");
  const saveBtn = document.getElementById("saveBtn");
  const cancelBtn = document.getElementById("cancelBtn");

  // عناصر رسائل الخطأ
  const jobTitleError = document.getElementById("jobTitleError");
  const companyNameError = document.getElementById("companyNameError");
  // const startDateError = document.getElementById('startDateError');
  // const endDateError = document.getElementById('endDateError');
  const stillWorkingError = document.getElementById("stillWorkingError");
  const contributionError = document.getElementById("contributionError");

  // التحقق من صحة المدخلات
  function validateJobTitle(jobTitle) {
    return jobTitle.trim() !== "";
  }

  function validateCompanyName(companyName) {
    return companyName.trim() !== "";
  }

  // function validateDate(date) {
  //     return date !== '';
  // }

  function validateContribution(contribution) {
    return contribution.trim().length >= 20;
  }

  // أحداث التحقق أثناء الكتابة
  jobTitleInput.addEventListener("input", function () {
    if (!validateJobTitle(this.value)) {
      jobTitleError.textContent = "المسمى الوظيفي مطلوب";
      this.classList.add("error-border");
    } else {
      jobTitleError.textContent = "";
      this.classList.remove("error-border");
    }
  });

  companyNameInput.addEventListener("input", function () {
    if (!validateCompanyName(this.value)) {
      companyNameError.textContent = "اسم الشركة مطلوب";
      this.classList.add("error-border");
    } else {
      companyNameError.textContent = "";
      this.classList.remove("error-border");
    }
  });

  // startDateInput.addEventListener('change', function() {
  //     if (!validateDate(this.value)) {
  //         startDateError.textContent = 'تاريخ البدء مطلوب';
  //         this.classList.add('error-border');
  //     } else {
  //         startDateError.textContent = '';
  //         this.classList.remove('error-border');
  //     }
  // });

  // endDateInput.addEventListener('change', function() {
  //     if (!stillWorkingCheckbox.checked && !validateDate(this.value)) {
  //         endDateError.textContent = 'تاريخ الانتهاء مطلوب';
  //         this.classList.add('error-border');
  //     } else {
  //         endDateError.textContent = '';
  //         this.classList.remove('error-border');
  //     }
  // });

  contributionTextarea.addEventListener("input", function () {
    if (!validateContribution(this.value)) {
      contributionError.textContent = "يجب كتابة ملخص لا يقل عن 20 حرفاً";
      this.classList.add("error-border");
    } else {
      contributionError.textContent = "";
      this.classList.remove("error-border");
    }
  });

  // التحقق عند الإرسال
  experienceForm.addEventListener("submit", function (e) {
    e.preventDefault();
    let isValid = true;

    // التحقق من المسمى الوظيفي
    if (!validateJobTitle(jobTitleInput.value)) {
      jobTitleError.textContent = "المسمى الوظيفي مطلوب";
      jobTitleInput.classList.add("error-border");
      isValid = false;
    }

    // التحقق من اسم الشركة
    if (!validateCompanyName(companyNameInput.value)) {
      companyNameError.textContent = "اسم الشركة مطلوب";
      companyNameInput.classList.add("error-border");
      isValid = false;
    }

    // التحقق من تاريخ البدء
    if (!validateDate(startDateInput.value)) {
      startDateError.textContent = "تاريخ البدء مطلوب";
      startDateInput.classList.add("error-border");
      isValid = false;
    }

    // التحقق من تاريخ الانتهاء (إذا لم يكن يعمل حالياً)
    if (!stillWorkingCheckbox.checked && !validateDate(endDateInput.value)) {
      endDateError.textContent = "تاريخ الانتهاء مطلوب";
      endDateInput.classList.add("error-border");
      isValid = false;
    }

    // التحقق من الملخص
    if (!validateContribution(contributionTextarea.value)) {
      contributionError.textContent = "يجب كتابة ملخص لا يقل عن 20 حرفاً";
      contributionTextarea.classList.add("error-border");
      isValid = false;
    }

    if (isValid) {
      // يمكنك إضافة كود الإرسال هنا
      alert("تم حفظ البيانات بنجاح");
      experienceForm.reset();
    } else {
      // الانتقال إلى أول حقل به خطأ
      const firstError = document.querySelector(".error-border");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  });

  // زر الإلغاء
  cancelBtn.addEventListener("click", function () {
    experienceForm.reset();
    // إخفاء جميع رسائل الخطأ
    document.querySelectorAll(".error").forEach((error) => {
      error.textContent = "";
    });
    // إزالة حدود الأخطاء
    document.querySelectorAll(".error-border").forEach((input) => {
      input.classList.remove("error-border");
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const certificateForm = document.getElementById("certificateForm");
  const certificateNameInput = document.getElementById("certificateName");
  const issuingAuthorityInput = document.getElementById("issuingAuthority");
  // const issueDateInput = document.getElementById('issueDate');
  // const expiryDateInput = document.getElementById('expiryDate');
  const certificateNumberInput = document.getElementById("certificateNumber");
  const certificateLinkInput = document.getElementById("certificateLink");
  const saveBtn = document.getElementById("saveBtnSP");
  const cancelBtn = document.getElementById("cancelBtnSP");

  // عناصر رسائل الخطأ
  const certificateNameError = document.getElementById("certificateNameError");
  const issuingAuthorityError = document.getElementById(
    "issuingAuthorityError"
  );
  // const issueDateError = document.getElementById('issueDateError');
  // const expiryDateError = document.getElementById('expiryDateError');
  const certificateNumberError = document.getElementById(
    "certificateNumberError"
  );
  const certificateLinkError = document.getElementById("certificateLinkError");

  // دوال التحقق من الصحة
  function validateCertificateName(name) {
    return name.trim() !== "";
  }

  function validateIssuingAuthority(authority) {
    return authority.trim() !== "";
  }

  // function validateDate(date) {
  //     return date !== '';
  // }

  // function validateDateRange(startDate, endDate) {
  //     if (!startDate || !endDate) return true;
  //     return new Date(startDate) <= new Date(endDate);
  // }

  function validateCertificateNumber(number) {
    return number.trim() !== "";
  }

  function validateCertificateLink(link) {
    if (link.trim() === "") return true; // Optional field
    try {
      new URL(link);
      return true;
    } catch (e) {
      return false;
    }
  }

  // أحداث التحقق أثناء الكتابة
  certificateNameInput.addEventListener("input", function () {
    if (!validateCertificateName(this.value)) {
      certificateNameError.textContent = "اسم الشهادة مطلوب";
      this.classList.add("error-border");
    } else {
      certificateNameError.textContent = "";
      this.classList.remove("error-border");
    }
  });

  issuingAuthorityInput.addEventListener("input", function () {
    if (!validateIssuingAuthority(this.value)) {
      issuingAuthorityError.textContent = "الجهة المانحة للشهادة مطلوبة";
      this.classList.add("error-border");
    } else {
      issuingAuthorityError.textContent = "";
      this.classList.remove("error-border");
    }
  });

  // issueDateInput.addEventListener('change', function() {
  //     if (!validateDate(this.value)) {
  //         issueDateError.textContent = 'تاريخ الإصدار مطلوب';
  //         this.classList.add('error-border');
  //     } else {
  //         issueDateError.textContent = '';
  //         this.classList.remove('error-border');

  // التحقق من أن تاريخ الإصدار قبل تاريخ الانتهاء
  // if (expiryDateInput.value && !validateDateRange(this.value, expiryDateInput.value)) {
  //     expiryDateError.textContent = 'يجب أن يكون تاريخ الانتهاء بعد تاريخ الإصدار';
  //     expiryDateInput.classList.add('error-border');
  // } else {
  //     expiryDateError.textContent = '';
  //     expiryDateInput.classList.remove('error-border');
  // }
  // }
  // });

  // expiryDateInput.addEventListener('change', function() {
  //     if (!validateDate(this.value)) {
  //         expiryDateError.textContent = 'تاريخ الانتهاء مطلوب';
  //         this.classList.add('error-border');
  //     } else if (!validateDateRange(issueDateInput.value, this.value)) {
  //         expiryDateError.textContent = 'يجب أن يكون تاريخ الانتهاء بعد تاريخ الإصدار';
  //         this.classList.add('error-border');
  //     } else {
  //         expiryDateError.textContent = '';
  //         this.classList.remove('error-border');
  //     }
  // });

  certificateNumberInput.addEventListener("input", function () {
    if (!validateCertificateNumber(this.value)) {
      certificateNumberError.textContent = "رقم الشهادة مطلوب";
      this.classList.add("error-border");
    } else {
      certificateNumberError.textContent = "";
      this.classList.remove("error-border");
    }
  });

  certificateLinkInput.addEventListener("input", function () {
    if (!validateCertificateLink(this.value)) {
      certificateLinkError.textContent = "الرجاء إدخال رابط صحيح";
      this.classList.add("error-border");
    } else {
      certificateLinkError.textContent = "";
      this.classList.remove("error-border");
    }
  });

  // التحقق عند الإرسال
  certificateForm.addEventListener("submit", function (e) {
    e.preventDefault();
    let isValid = true;

    if (!validateCertificateName(certificateNameInput.value)) {
      certificateNameError.textContent = "اسم الشهادة مطلوب";
      certificateNameInput.classList.add("error-border");
      isValid = false;
    }

    if (!validateIssuingAuthority(issuingAuthorityInput.value)) {
      issuingAuthorityError.textContent = "الجهة المانحة للشهادة مطلوبة";
      issuingAuthorityInput.classList.add("error-border");
      isValid = false;
    }

    // if (!validateDate(issueDateInput.value)) {
    //     issueDateError.textContent = 'تاريخ الإصدار مطلوب';
    //     issueDateInput.classList.add('error-border');
    //     isValid = false;
    // }

    // if (!validateDate(expiryDateInput.value)) {
    //     expiryDateError.textContent = 'تاريخ الانتهاء مطلوب';
    //     expiryDateInput.classList.add('error-border');
    //     isValid = false;
    // } else if (!validateDateRange(issueDateInput.value, expiryDateInput.value)) {
    //     expiryDateError.textContent = 'يجب أن يكون تاريخ الانتهاء بعد تاريخ الإصدار';
    //     expiryDateInput.classList.add('error-border');
    //     isValid = false;
    // }

    if (!validateCertificateNumber(certificateNumberInput.value)) {
      certificateNumberError.textContent = "رقم الشهادة مطلوب";
      certificateNumberInput.classList.add("error-border");
      isValid = false;
    }

    if (!validateCertificateLink(certificateLinkInput.value)) {
      certificateLinkError.textContent = "الرجاء إدخال رابط صحيح";
      certificateLinkInput.classList.add("error-border");
      isValid = false;
    }

    if (isValid) {
      // يمكنك إضافة كود الإرسال هنا
      alert("تم حفظ بيانات الشهادة بنجاح");
      certificateForm.reset();
    } else {
      // الانتقال إلى أول حقل به خطأ
      const firstError = document.querySelector(".error-border");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  });

  // زر الإلغاء
  cancelBtn.addEventListener("click", function () {
    certificateForm.reset();
    // إخفاء جميع رسائل الخطأ
    document.querySelectorAll(".error").forEach((error) => {
      error.textContent = "";
    });
    // إزالة حدود الأخطاء
    document.querySelectorAll(".error-border").forEach((input) => {
      input.classList.remove("error-border");
    });
  });
});
