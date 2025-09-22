document.addEventListener('DOMContentLoaded', () => {
            const buttons = document.querySelectorAll('.panel-but');
            const sections = document.querySelectorAll('.panel-text section');

            buttons.forEach(button => {
                button.addEventListener('click', () => {
                    // Remove active class from all buttons and sections
                    buttons.forEach(btn => btn.classList.remove('active'));
                    sections.forEach(section => section.classList.remove('active'));

                    // Add active class to clicked button and corresponding section
                    button.classList.add('active');
                    const targetId = button.getAttribute('data-target');
                    const targetSection = document.getElementById(targetId);
                    if (targetSection) {
                        targetSection.classList.add('active');
                    }
                });
            });
        });