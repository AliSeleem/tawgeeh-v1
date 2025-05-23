document.addEventListener('DOMContentLoaded', function() {
  const saveBtn = document.getElementById('save-btn');
  
  // Form validation and save functionality
  saveBtn.addEventListener('click', function() {
      const maxDays = document.getElementById('max-days').value;
      const minHours = document.getElementById('min-hours').value;
      const maxAppointments = document.getElementById('max-appointments').value;
      
      // Validate inputs
      if (!maxDays || !minHours || !maxAppointments) {
          alert('الرجاء ملء جميع الحقول المطلوبة');
          return;
      }
      
      if (maxAppointments < 1 || maxAppointments > 50) {
          alert('الحد الأقصى للمواعيد اليومية يجب أن يكون بين 1 و 50');
          return;
      }
      
      // In a real application, you would send this data to the server
      const settings = {
          maxDaysAdvance: maxDays,
          minHoursBefore: minHours,
          maxDailyAppointments: maxAppointments
      };
      
      console.log('Settings to be saved:', settings);
      alert('تم حفظ الإعدادات بنجاح');
      
      // Here you would typically send the data to your backend
      // fetch('/api/settings', {
      //     method: 'POST',
      //     headers: {
      //         'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify(settings)
      // })
      // .then(response => response.json())
      // .then(data => {
      //     console.log('Success:', data);
      //     alert('تم حفظ الإعدادات بنجاح');
      // })
      // .catch((error) => {
      //     console.error('Error:', error);
      //     alert('حدث خطأ أثناء حفظ الإعدادات');
      // });
  });
  
  // Toggle day availability (optional functionality)
  const dayStatuses = document.querySelectorAll('.day-status');
  dayStatuses.forEach(status => {
      status.addEventListener('click', function() {
          if (this.classList.contains('unavailable')) {
              this.classList.remove('unavailable');
              this.classList.add('available');
              this.textContent = 'متاح';
          } else {
              this.classList.remove('available');
              this.classList.add('unavailable');
              this.textContent = 'غير متاح';
          }
      });
  });
});