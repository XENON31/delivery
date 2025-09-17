// إدارة الحالة العامة للتطبيق
const App = {
    currentUser: localStorage.getItem('currentUser') || 'زائر',
    posts: [],
    filters: {
        city: '',
        market: '',
        type: ''
    },
    theme: localStorage.getItem('theme') || 'light'
};

// تهيئة التطبيق
function initApp() {
    // تطبيق السمة المحفوظة
    document.body.setAttribute('data-theme', App.theme);
    updateThemeIcon();
    
    // تحديث واجهة المستخدم
    updateUserDisplay();
    loadPostsFromServer();
    setupEventListeners();
    updateFilterOptions();
    
    // تهيئة عناصر Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // تفعيل تأثيرات التمرير
    setTimeout(setupScrollAnimations, 500);
}

// محاكاة قاعدة بيانات باستخدام localStorage
const DB = {
    // الحصول على جميع الطلبات
    getAllPosts: function() {
        const posts = JSON.parse(localStorage.getItem('deliveryAppPosts')) || [];
        return posts;
    },
    
    // حفظ الطلبات
    savePosts: function(posts) {
        localStorage.setItem('deliveryAppPosts', JSON.stringify(posts));
    },
    
    // إضافة طلب جديد
    addPost: function(post) {
        const posts = this.getAllPosts();
        posts.unshift(post);
        this.savePosts(posts);
        return posts;
    },
    
    // تحديث طلب موجود
    updatePost: function(postId, updates) {
        const posts = this.getAllPosts();
        const postIndex = posts.findIndex(post => post.id === postId);
        
        if (postIndex !== -1) {
            posts[postIndex] = { ...posts[postIndex], ...updates };
            this.savePosts(posts);
            return true;
        }
        return false;
    },
    
    // حذف طلب
    deletePost: function(postId) {
        const posts = this.getAllPosts();
        const filteredPosts = posts.filter(post => post.id !== postId);
        this.savePosts(filteredPosts);
        return filteredPosts;
    }
};

// تحميل المنشورات من "الخادم" (localStorage)
function loadPostsFromServer() {
    App.posts = DB.getAllPosts();
    renderPosts();
}

// حفظ المنشورات إلى "الخادم" (localStorage)
function savePostsToServer() {
    DB.savePosts(App.posts);
}

// عرض المنشورات
function renderPosts() {
    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = '';
    
    let filteredPosts = App.posts;
    
    // تطبيق التصفية إذا كانت محددة
    if (App.filters.city) {
        filteredPosts = filteredPosts.filter(post => post.city === App.filters.city);
    }
    
    if (App.filters.market) {
        filteredPosts = filteredPosts.filter(post => post.market === App.filters.market);
    }
    
    if (App.filters.type) {
        filteredPosts = filteredPosts.filter(post => post.type === App.filters.type);
    }
    
    if (filteredPosts.length === 0) {
        postsContainer.innerHTML = `
            <div class="col-12 text-center py-5 fade-in">
                <i class="fas fa-inbox fa-3x mb-3 text-muted"></i>
                <h5 class="text-muted">لا توجد طلبات متاحة حالياً</h5>
                <p class="text-muted">كن أول من ينشر طلب توصيل!</p>
            </div>
        `;
        // تفعيل تأثيرات التمرير بعد تحميل المحتوى
        setTimeout(setupScrollAnimations, 100);
        return;
    }
    
    filteredPosts.forEach((post, index) => {
        const postElement = createPostElement(post);
        // إضافة تأثير تأخير للتتابع
        postElement.style.animationDelay = `${index * 0.1}s`;
        postsContainer.appendChild(postElement);
    });
    
    // تفعيل تأثيرات التمرير بعد تحميل المحتوى
    setTimeout(setupScrollAnimations, 100);
}

// تحديث عرض اسم المستخدم
function updateUserDisplay() {
    document.getElementById('current-user').textContent = App.currentUser;
    
    // إظهار/إخفاء عناصر تسجيل الدخول
    if (App.currentUser !== 'زائر') {
        document.getElementById('login-nav-item').classList.add('d-none');
        document.getElementById('user-nav-item').classList.remove('d-none');
        document.getElementById('user-name').value = App.currentUser;
    } else {
        document.getElementById('login-nav-item').classList.remove('d-none');
        document.getElementById('user-nav-item').classList.add('d-none');
    }
}

// إنشاء عنصر منشور
function createPostElement(post) {
    const colDiv = document.createElement('div');
    colDiv.className = 'col-md-6 col-lg-4 fade-in';
    
    const postDiv = document.createElement('div');
    postDiv.className = 'card post-card shadow-sm h-100';
    postDiv.id = `post-${post.id}`;
    
    const postBody = document.createElement('div');
    postBody.className = 'card-body';
    
    const postHeader = document.createElement('div');
    postHeader.className = 'post-header';
    
    const authorSpan = document.createElement('span');
    authorSpan.className = 'post-author';
    authorSpan.textContent = post.author;
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'post-time';
    timeSpan.textContent = formatTime(post.timestamp);
    
    postHeader.appendChild(authorSpan);
    postHeader.appendChild(timeSpan);
    
    const postContent = document.createElement('div');
    postContent.className = 'post-content';
    postContent.textContent = post.content;
    
    const postDetails = document.createElement('div');
    postDetails.className = 'post-details';
    
    const cityDetail = document.createElement('span');
    cityDetail.className = 'post-detail';
    cityDetail.innerHTML = `<i class="fas fa-city me-1"></i> ${post.city}`;
    
    const typeDetail = document.createElement('span');
    typeDetail.className = 'post-detail';
    typeDetail.innerHTML = `<i class="fas fa-tag me-1"></i> ${post.type}`;
    
    const marketDetail = document.createElement('span');
    marketDetail.className = 'post-detail';
    marketDetail.innerHTML = `<i class="fas fa-store me-1"></i> ${post.market}`;
    
    const paymentDetail = document.createElement('span');
    paymentDetail.className = 'post-detail';
    paymentDetail.innerHTML = `<i class="fas fa-money-bill-wave me-1"></i> ${post.payment}`;
    
    postDetails.appendChild(cityDetail);
    postDetails.appendChild(typeDetail);
    postDetails.appendChild(marketDetail);
    postDetails.appendChild(paymentDetail);
    
    const postActions = document.createElement('div');
    postActions.className = 'post-actions';
    
    // إضافة زر الاستلام إذا لم يكن المستخدم هو صاحب المنشور ولم يتم استلامه بعد
    if (App.currentUser !== 'زائر' && App.currentUser !== post.author && !post.accepted) {
        const acceptBtn = document.createElement('button');
        acceptBtn.className = 'btn btn-sm btn-success';
        acceptBtn.innerHTML = '<i class="fas fa-hand-holding me-1"></i> استلم الطلب';
        acceptBtn.addEventListener('click', () => acceptPost(post.id));
        postActions.appendChild(acceptBtn);
    }
    
    // إضافة زر الإلغاء إذا كان المستخدم هو صاحب المنشور ولم يتم استلامه بعد
    if (App.currentUser === post.author && !post.accepted) {
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-sm btn-outline-danger';
        cancelBtn.innerHTML = '<i class="fas fa-times me-1"></i> إلغاء';
        cancelBtn.addEventListener('click', () => cancelPost(post.id));
        postActions.appendChild(cancelBtn);
    }
    
    postBody.appendChild(postHeader);
    postBody.appendChild(postContent);
    postBody.appendChild(postDetails);
    
    // إظهار معلومات الاستلام إذا تم استلام الطلب
    if (post.accepted) {
        const acceptedBy = document.createElement('div');
        acceptedBy.className = 'accepted-by';
        acceptedBy.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-check-circle text-success me-2"></i>
                <div>
                    <strong>تم استلام الطلب بواسطة:</strong> 
                    <span class="text-success">${post.acceptedBy}</span>
                </div>
            </div>
        `;
        postBody.appendChild(acceptedBy);
    }
    
    postBody.appendChild(postActions);
    postDiv.appendChild(postBody);
    colDiv.appendChild(postDiv);
    
    return colDiv;
}

// توليد نجوم التقييم
function generateStarRating(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// تنسيق الوقت
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // إذا مضى أقل من دقيقة
    if (diff < 60000) {
        return 'الآن';
    }
    
    // إذا مضى أقل من ساعة
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `منذ ${minutes} دقيقة`;
    }
    
    // إذا مضى أقل من يوم
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `منذ ${hours} ساعة`;
    }
    
    // إذا مضى أكثر من يوم
    const days = Math.floor(diff / 86400000);
    return `منذ ${days} يوم`;
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // فتح نافذة إنشاء منشور
    document.getElementById('create-post-btn').addEventListener('click', openCreatePostModal);
    
    // إرسال المنشور
    document.getElementById('submit-post').addEventListener('click', handlePostSubmit);
    
    // فتح نافذة تسجيل الدخول
    document.getElementById('login-btn-nav').addEventListener('click', openLoginModal);
    
    // إرسال تسجيل الدخول
    document.getElementById('submit-login').addEventListener('click', handleLogin);
    
    // أزرار التصفية
    document.getElementById('apply-filters').addEventListener('click', applyFilters);
    document.getElementById('clear-filters').addEventListener('click', clearFilters);
    
    // تبديل السمة
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    // التنقل بين الصفحات
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            showPage(page);
        });
    });
}

// معالجة إنشاء منشور جديد
function handlePostSubmit() {
    if (App.currentUser === 'زائر') {
        showNotification('يجب تسجيل الدخول أولاً', 'warning');
        openLoginModal();
        return;
    }
    
    const userName = document.getElementById('user-name').value;
    const requestType = document.getElementById('request-type').value;
    const city = document.getElementById('city').value;
    const marketName = document.getElementById('market-name').value;
    const paymentMethod = document.getElementById('payment-method').value;
    const requestDetails = document.getElementById('request-details').value;
    
    if (!userName || !requestType || !city || !marketName || !paymentMethod) {
        showNotification('يرجى ملء جميع الحقول المطلوبة', 'warning');
        return;
    }
    
    const newPost = {
        id: Date.now(),
        author: userName,
        content: `أحتاج مساعدة في: ${requestType} من ${marketName}${requestDetails ? ` - ${requestDetails}` : ''}`,
        type: requestType,
        city: city,
        market: marketName,
        payment: paymentMethod,
        timestamp: Date.now(),
        accepted: false,
        acceptedBy: '',
        rating: 0
    };
    
    // حفظ الطلب في "قاعدة البيانات"
    DB.addPost(newPost);
    
    // تحديث التطبيق بالبيانات الجديدة
    loadPostsFromServer();
    
    // إغلاق النافذة المنبثقة
    const modal = bootstrap.Modal.getInstance(document.getElementById('create-post-modal'));
    modal.hide();
    
    // إشعار بنجاح النشر
    showNotification('تم نشر طلبك بنجاح!', 'success');
}

// معالجة تسجيل الدخول
function handleLogin() {
    const userName = document.getElementById('login-name').value.trim();
    
    if (userName) {
        App.currentUser = userName;
        localStorage.setItem('currentUser', userName);
        updateUserDisplay();
        
        // إغلاق النافذة المنبثقة
        const modal = bootstrap.Modal.getInstance(document.getElementById('login-modal'));
        modal.hide();
        
        showNotification(`مرحباً ${userName}!`, 'success');
    } else {
        showNotification('يرجى إدخال اسم المستخدم', 'warning');
    }
}

// استلام طلب
function acceptPost(postId) {
    const success = DB.updatePost(postId, {
        accepted: true,
        acceptedBy: App.currentUser
    });
    
    if (success) {
        // تحديث التطبيق بالبيانات الجديدة
        loadPostsFromServer();
        
        // إشعار للمستخدم
        const post = DB.getAllPosts().find(p => p.id === postId);
        showNotification(`لقد استلمت الطلب بنجاح! يرجى التواصل مع ${post.author} لترتيب عملية التوصيل`, 'success');
    }
}

// إلغاء طلب
function cancelPost(postId) {
    if (confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) {
        const posts = DB.getAllPosts();
        const postIndex = posts.findIndex(post => post.id === postId);
        
        if (postIndex !== -1) {
            const post = posts[postIndex];
            
            // إذا كان الطلب مستلمًا، نرسل إشعارًا
            if (post.accepted) {
                showNotification(`تم إلغاء الطلب. سيتم إخطار ${post.acceptedBy} بالإلغاء`, 'info');
            }
            
            // حذف الطلب من "قاعدة البيانات"
            DB.deletePost(postId);
            
            // تحديث التطبيق بالبيانات الجديدة
            loadPostsFromServer();
            
            showNotification('تم إلغاء الطلب بنجاح', 'success');
        }
    }
}

// تطبيق التصفية
function applyFilters() {
    App.filters.city = document.getElementById('filter-city').value;
    App.filters.market = document.getElementById('filter-market').value;
    App.filters.type = document.getElementById('filter-type').value;
    renderPosts();
}

// إعادة ضبط التصفية
function clearFilters() {
    document.getElementById('filter-city').value = '';
    document.getElementById('filter-market').value = '';
    document.getElementById('filter-type').value = '';
    App.filters.city = '';
    App.filters.market = '';
    App.filters.type = '';
    renderPosts();
}

// تحديث خيارات التصفية
function updateFilterOptions() {
    const marketFilter = document.getElementById('filter-market');
    const typeFilter = document.getElementById('filter-type');
    
    // الحصول على القيم الفريدة من المنشورات
    const markets = [...new Set(App.posts.map(post => post.market))];
    const types = [...new Set(App.posts.map(post => post.type))];
    
    // تحديث خيارات السوق
    marketFilter.innerHTML = '<option value="">جميع الأسواق</option>';
    markets.forEach(market => {
        if (market) {
            const option = document.createElement('option');
            option.value = market;
            option.textContent = market;
            marketFilter.appendChild(option);
        }
    });
    
    // تحديث خيارات النوع
    typeFilter.innerHTML = '<option value="">جميع الأنواع</option>';
    types.forEach(type => {
        if (type) {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            typeFilter.appendChild(option);
        }
    });
}

// فتح نافذة إنشاء منشور
function openCreatePostModal() {
    if (App.currentUser === 'زائر') {
        showNotification('يجب تسجيل الدخول أولاً', 'warning');
        openLoginModal();
        return;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('create-post-modal'));
    modal.show();
}

// فتح نافذة تسجيل الدخول
function openLoginModal() {
    const modal = new bootstrap.Modal(document.getElementById('login-modal'));
    modal.show();
}

// عرض صفحة محددة
function showPage(page) {
    // إخفاء جميع الصفحات
    document.querySelectorAll('.page').forEach(element => {
        element.classList.add('d-none');
    });
    
    document.querySelector('main').classList.add('d-none');
    
    // إظهار الصفحة المطلوبة
    if (page === 'home') {
        document.querySelector('main').classList.remove('d-none');
    } else {
        document.getElementById(`${page}-page`).classList.remove('d-none');
    }
    
    // التمرير إلى الأعلى
    window.scrollTo(0, 0);
}

// تبديل السمة
function toggleTheme() {
    if (App.theme === 'light') {
        App.theme = 'dark';
    } else {
        App.theme = 'light';
    }
    
    document.body.setAttribute('data-theme', App.theme);
    localStorage.setItem('theme', App.theme);
    updateThemeIcon();
}

// تحديث أيقونة السمة
function updateThemeIcon() {
    const themeIcon = document.getElementById('theme-toggle').querySelector('i');
    
    if (App.theme === 'light') {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    } else {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }
}

// عرض إشعار
function showNotification(message, type = 'info') {
    // إنشاء عنصر إشعار
    const notification = document.createElement('div');
    notification.className = `notification bg-${type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'info'}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // إزالة الإشعار بعد 3 ثوان
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

// تأثيرات التمرير
function setupScrollAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, 100);
            }
        });
    }, {
        threshold: 0.1
    });
    
    fadeElements.forEach(el => {
        observer.observe(el);
    });
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initApp);