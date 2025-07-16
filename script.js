// 카테고리별 공지 데이터 파일 불러오기
// (HTML에서 <script src="noticeData_캐릭터.js"></script> 등으로 모두 불러온다고 가정)

// 모든 카테고리 데이터를 하나의 배열로 합침
const noticeDataList = [
    ...(typeof noticeData_캐릭터 !== 'undefined' ? noticeData_캐릭터 : []),
    ...(typeof noticeData_컨텐츠 !== 'undefined' ? noticeData_컨텐츠 : []),
    ...(typeof noticeData_육성 !== 'undefined' ? noticeData_육성 : []),
    ...(typeof noticeData_보계 !== 'undefined' ? noticeData_보계 : []),
    ...(typeof noticeData_기타 !== 'undefined' ? noticeData_기타 : [])
];

// 모바일 네비게이션 드롭다운 열기/닫기 기능 (로고 아래)
const gnbHamburgerBtn = document.getElementById('gnbHamburgerBtn');
const gnbMobileMenu = document.getElementById('gnbMobileMenu');
// 닫기 버튼 삭제됨

if (gnbHamburgerBtn && gnbMobileMenu) {
    // 햄버거 아이콘 클릭 시 드롭다운 메뉴 토글
    gnbHamburgerBtn.addEventListener('click', function() {
        gnbMobileMenu.classList.toggle('show');
    });
}

// 반응형 카테고리 드롭다운 동작
const categoryDropdownBtn = document.getElementById('categoryDropdownBtn');
const categoryDropdownList = document.getElementById('categoryDropdownList');
const categoryDropdownSelected = document.getElementById('categoryDropdownSelected');

if (categoryDropdownBtn && categoryDropdownList && categoryDropdownSelected) {
    // 드롭다운 버튼 클릭 시 메뉴 토글
    categoryDropdownBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        categoryDropdownList.classList.toggle('show');
        categoryDropdownBtn.classList.toggle('open');
    });
    // 카테고리 선택 시 드롭다운 닫고 필터링
    categoryDropdownList.querySelectorAll('li').forEach(function(li) {
        li.addEventListener('click', function(e) {
            e.stopPropagation();
            // 선택 표시
            categoryDropdownList.querySelectorAll('li').forEach(el => el.classList.remove('selected'));
            li.classList.add('selected');
            // 텍스트 반영
            categoryDropdownSelected.textContent = li.textContent;
            // 드롭다운 닫기
            categoryDropdownList.classList.remove('show');
            categoryDropdownBtn.classList.remove('open');
            // 카테고리 필터링
            currentCategory = li.getAttribute('data-category');
            // 기존 카테고리 탭 active도 동기화
            document.querySelectorAll('.category-tab').forEach(btn => {
                if (btn.getAttribute('data-category') === currentCategory) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            renderNoticeList(currentCategory, currentSearchKeyword);
        });
    });
    // 바깥 클릭 시 드롭다운 닫기
    document.addEventListener('click', function(e) {
        categoryDropdownList.classList.remove('show');
        categoryDropdownBtn.classList.remove('open');
    });
}

// 현재 선택된 카테고리와 검색어를 저장
let currentCategory = '전체';
let currentSearchKeyword = '';

// 한 페이지에 보여줄 공지 개수
const NOTICES_PER_PAGE = 10;
let currentPage = 1;

// 페이지네이션을 렌더링하는 함수
function renderPagination(totalNotices, currentPage) {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;
    const totalPages = Math.ceil(totalNotices / NOTICES_PER_PAGE);
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    let html = '<span class="pagination-arrow" data-page="prev">&#60;</span>';
    for (let i = 1; i <= totalPages; i++) {
        html += `<span class="pagination-page${i === currentPage ? ' active' : ''}" data-page="${i}">${i}</span>`;
    }
    html += '<span class="pagination-arrow" data-page="next">&#62;</span>';
    paginationContainer.innerHTML = html;

    // 페이지 클릭 이벤트 연결
    paginationContainer.querySelectorAll('span[data-page]').forEach(function(pageBtn) {
        pageBtn.addEventListener('click', function() {
            let page = pageBtn.getAttribute('data-page');
            if (page === 'prev') {
                if (currentPage > 1) {
                    currentPage--;
                    renderNoticeList(currentCategory, currentSearchKeyword, currentPage);
                }
            } else if (page === 'next') {
                if (currentPage < totalPages) {
                    currentPage++;
                    renderNoticeList(currentCategory, currentSearchKeyword, currentPage);
                }
            } else {
                currentPage = parseInt(page);
                renderNoticeList(currentCategory, currentSearchKeyword, currentPage);
            }
        });
    });
}

// 공지 목록을 렌더링하는 함수 (페이지네이션 추가)
function renderNoticeList(selectedCategory, searchKeyword, page = 1) {
    const noticeListContainer = document.getElementById('notice-list');
    if (!noticeListContainer) return;

    let filteredNotices = selectedCategory === '전체'
        ? noticeDataList
        : noticeDataList.filter(notice => notice.category === selectedCategory);

    if (searchKeyword && searchKeyword.trim() !== '') {
        const keyword = searchKeyword.trim().toLowerCase();
        filteredNotices = filteredNotices.filter(notice =>
            notice.title.toLowerCase().includes(keyword)
        );
    }

    // 페이지네이션 적용: 현재 페이지에 해당하는 공지만 추출
    const startIdx = (page - 1) * NOTICES_PER_PAGE;
    const endIdx = startIdx + NOTICES_PER_PAGE;
    const pagedNotices = filteredNotices.slice(startIdx, endIdx);

    if (filteredNotices.length === 0) {
        noticeListContainer.innerHTML = `
            <div class="no-result-message" style="padding: 48px 0; text-align: center; color: #888; font-size: 1.08rem;">검색 결과가 없습니다.</div>
        `;
        renderPagination(0, 1);
        return;
    }

    noticeListContainer.innerHTML = pagedNotices.map((notice, idx) => `
        <div class="accordion-item" data-index="${startIdx + idx}">
            <div class="accordion-header">
                <div class="notice-category">${notice.category}</div>
                <button class="accordion-title">${notice.title}</button>
                <div class="notice-date">${notice.date}</div>
            </div>
            <div class="accordion-content">
                <p>${notice.content}</p>
            </div>
        </div>
    `).join('');

    setAccordionEventListeners();
    renderPagination(filteredNotices.length, page);
}

// 아코디언 펼침/접힘 기능 연결 함수
function setAccordionEventListeners() {
    // .accordion-header 내부의 .accordion-title에만 이벤트 연결
    const accordionTitleButtons = document.querySelectorAll('.accordion-title');
    accordionTitleButtons.forEach(function(titleButton) {
        titleButton.addEventListener('click', function() {
            // .accordion-header의 부모가 .accordion-item
            const currentAccordionItem = titleButton.closest('.accordion-item');
            if (!currentAccordionItem) return;
            // 이미 열려있으면 닫기
            if (currentAccordionItem.classList.contains('active')) {
                currentAccordionItem.classList.remove('active');
                return;
            }
            // 다른 아이템 닫기
            document.querySelectorAll('.accordion-item.active').forEach(function(openItem) {
                openItem.classList.remove('active');
            });
            // 현재 아이템 열기
            currentAccordionItem.classList.add('active');
        });
    });
}

// 카테고리 탭 클릭 이벤트 연결
const categoryTabButtons = document.querySelectorAll('.category-tab');
categoryTabButtons.forEach(function(tabButton) {
    tabButton.addEventListener('click', function() {
        // 모든 탭에서 active 제거
        categoryTabButtons.forEach(btn => btn.classList.remove('active'));
        // 현재 탭에 active 추가
        tabButton.classList.add('active');
        // 해당 카테고리로 공지 목록 렌더링
        currentCategory = tabButton.getAttribute('data-category');
        renderNoticeList(currentCategory, currentSearchKeyword);
    });
});

// 검색창 입력 이벤트 연결
const noticeSearchInput = document.getElementById('notice-search-input');
if (noticeSearchInput) {
    noticeSearchInput.addEventListener('input', function() {
        currentSearchKeyword = noticeSearchInput.value;
        renderNoticeList(currentCategory, currentSearchKeyword);
    });
}

// 최초 페이지 로드 시 전체 공지 렌더링 (페이지네이션 적용)
renderNoticeList(currentCategory, currentSearchKeyword, currentPage); 