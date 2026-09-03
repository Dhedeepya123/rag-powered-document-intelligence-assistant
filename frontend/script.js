const API_BASE = "http://localhost:8081";

let currentUser = null;
let conversations = [];
let documents = [];
let currentConversationId = null;


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadStoredData();

    setupAuthentication();

    setupNavigation();

    setupDashboard();

    setupUpload();

    setupConversations();

    setupAccount();

    checkLoginState();

});


/* =========================================================
   LOCAL STORAGE
========================================================= */

function loadStoredData() {

    const storedUser = localStorage.getItem("ragCurrentUser");

    if (storedUser) {
        try {
            currentUser = JSON.parse(storedUser);
        } catch (error) {
            currentUser = null;
        }
    }


    const storedConversations =
        localStorage.getItem("ragConversations");

    if (storedConversations) {

        try {
            conversations = JSON.parse(storedConversations);

        } catch (error) {

            conversations = [];

        }

    }


    const storedDocuments =
        localStorage.getItem("ragDocuments");

    if (storedDocuments) {

        try {
            documents = JSON.parse(storedDocuments);

        } catch (error) {

            documents = [];

        }

    }

}


function saveConversations() {

    localStorage.setItem(
        "ragConversations",
        JSON.stringify(conversations)
    );

}


function saveDocuments() {

    localStorage.setItem(
        "ragDocuments",
        JSON.stringify(documents)
    );

}


/* =========================================================
   AUTHENTICATION
========================================================= */

function setupAuthentication() {

    const loginForm =
        document.getElementById("loginForm");

    const signupForm =
        document.getElementById("signupForm");

    const forgotPasswordForm =
        document.getElementById("forgotPasswordForm");


    const showSignupButton =
        document.getElementById("showSignupButton");

    const showLoginButton =
        document.getElementById("showLoginButton");

    const forgotPasswordLink =
        document.getElementById("forgotPasswordLink");

    const backToLoginButton =
        document.getElementById("backToLoginButton");


    if (loginForm) {

        loginForm.addEventListener("submit", handleLogin);

    }


    if (signupForm) {

        signupForm.addEventListener(
            "submit",
            handleSignup
        );

    }


    if (forgotPasswordForm) {

        forgotPasswordForm.addEventListener(
            "submit",
            handleForgotPassword
        );

    }


    if (showSignupButton) {

        showSignupButton.addEventListener(
            "click",
            showSignup
        );

    }


    if (showLoginButton) {

        showLoginButton.addEventListener(
            "click",
            showLogin
        );

    }


    if (forgotPasswordLink) {

        forgotPasswordLink.addEventListener(
            "click",
            showForgotPassword
        );

    }


    if (backToLoginButton) {

        backToLoginButton.addEventListener(
            "click",
            showLogin
        );

    }

}


/* =========================================================
   LOGIN
========================================================= */

function handleLogin(event) {

    event.preventDefault();


    const email =
        document.getElementById("loginEmail")
            .value
            .trim()
            .toLowerCase();


    const password =
        document.getElementById("loginPassword")
            .value;


    const message =
        document.getElementById("loginMessage");


    const storedUser =
        localStorage.getItem(
            "ragRegisteredUser"
        );


    if (!storedUser) {

        showAuthMessage(
            message,
            "No account found. Please sign up first.",
            "error"
        );

        return;

    }


    let registeredUser;

    try {

        registeredUser =
            JSON.parse(storedUser);

    } catch (error) {

        showAuthMessage(
            message,
            "Unable to read account information.",
            "error"
        );

        return;

    }


    if (
        email !== registeredUser.email ||
        password !== registeredUser.password
    ) {

        showAuthMessage(
            message,
            "Invalid email or password.",
            "error"
        );

        return;

    }


    currentUser = {
        name: registeredUser.name,
        email: registeredUser.email
    };


    localStorage.setItem(
        "ragCurrentUser",
        JSON.stringify(currentUser)
    );


    showAuthMessage(
        message,
        "Login successful.",
        "success"
    );


    setTimeout(() => {

        showApplication();

    }, 300);

}


/* =========================================================
   SIGN UP
========================================================= */

function handleSignup(event) {

    event.preventDefault();


    const name =
        document.getElementById("signupName")
            .value
            .trim();


    const email =
        document.getElementById("signupEmail")
            .value
            .trim()
            .toLowerCase();


    const password =
        document.getElementById("signupPassword")
            .value;


    const confirmPassword =
        document.getElementById(
            "signupConfirmPassword"
        ).value;


    const message =
        document.getElementById("signupMessage");


    if (name.length < 2) {

        showAuthMessage(
            message,
            "Please enter your name.",
            "error"
        );

        return;

    }


    if (password.length < 6) {

        showAuthMessage(
            message,
            "Password must contain at least 6 characters.",
            "error"
        );

        return;

    }


    if (password !== confirmPassword) {

        showAuthMessage(
            message,
            "Passwords do not match.",
            "error"
        );

        return;

    }


    const existingUser =
        localStorage.getItem(
            "ragRegisteredUser"
        );


    if (existingUser) {

        try {

            const registeredUser =
                JSON.parse(existingUser);

            if (registeredUser.email === email) {

                showAuthMessage(
                    message,
                    "An account with this email already exists.",
                    "error"
                );

                return;

            }

        } catch (error) {

            // Continue and overwrite invalid stored data.

        }

    }


    const newUser = {
        name: name,
        email: email,
        password: password
    };


    localStorage.setItem(
        "ragRegisteredUser",
        JSON.stringify(newUser)
    );


    showAuthMessage(
        message,
        "Account created successfully. You can now login.",
        "success"
    );


    document.getElementById(
        "signupForm"
    ).reset();


    setTimeout(() => {

        showLogin();

        document.getElementById(
            "loginEmail"
        ).value = email;

    }, 800);

}


/* =========================================================
   FORGOT PASSWORD
========================================================= */

function handleForgotPassword(event) {

    event.preventDefault();


    const email =
        document.getElementById("forgotEmail")
            .value
            .trim()
            .toLowerCase();


    const message =
        document.getElementById("forgotMessage");


    const storedUser =
        localStorage.getItem(
            "ragRegisteredUser"
        );


    if (!storedUser) {

        showAuthMessage(
            message,
            "No registered account was found.",
            "error"
        );

        return;

    }


    let registeredUser;

    try {

        registeredUser =
            JSON.parse(storedUser);

    } catch (error) {

        showAuthMessage(
            message,
            "Unable to access account information.",
            "error"
        );

        return;

    }


    if (registeredUser.email !== email) {

        showAuthMessage(
            message,
            "No account exists with this email.",
            "error"
        );

        return;

    }


    showAuthMessage(
        message,
        "Password reset request received. For this local demo, your account is ready to use again.",
        "success"
    );

}


/* =========================================================
   AUTH SCREEN SWITCHING
========================================================= */

function hideAuthPanels() {

    const panels = [
        "loginPanel",
        "signupPanel",
        "forgotPasswordPanel"
    ];


    panels.forEach(id => {

        const panel =
            document.getElementById(id);

        if (panel) {

            panel.classList.add("hidden");

        }

    });

}


function showLogin() {

    hideAuthPanels();

    document
        .getElementById("loginPanel")
        .classList.remove("hidden");

    clearAuthMessages();

}


function showSignup() {

    hideAuthPanels();

    document
        .getElementById("signupPanel")
        .classList.remove("hidden");

    clearAuthMessages();

}


function showForgotPassword() {

    hideAuthPanels();

    document
        .getElementById("forgotPasswordPanel")
        .classList.remove("hidden");

    clearAuthMessages();

}


function clearAuthMessages() {

    [
        "loginMessage",
        "signupMessage",
        "forgotMessage"
    ].forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {

            element.textContent = "";

            element.className =
                "auth-message";

        }

    });

}


function showAuthMessage(
    element,
    text,
    type
) {

    if (!element) {
        return;
    }


    element.textContent = text;

    element.className =
        "auth-message " + type;

}


/* =========================================================
   LOGIN STATE
========================================================= */

function checkLoginState() {

    const loginPage =
        document.getElementById("loginPage");

    const appWrapper =
        document.getElementById("appWrapper");


    if (currentUser) {

        if (loginPage) {
            loginPage.classList.add("hidden");
        }

        if (appWrapper) {
            appWrapper.classList.remove("hidden");
        }

        updateAccountInformation();

        showView("dashboard");

    } else {

        if (loginPage) {
            loginPage.classList.remove("hidden");
        }

        if (appWrapper) {
            appWrapper.classList.add("hidden");
        }

    }

}


function showApplication() {

    const loginPage =
        document.getElementById("loginPage");

    const appWrapper =
        document.getElementById("appWrapper");


    if (loginPage) {
        loginPage.classList.add("hidden");
    }


    if (appWrapper) {
        appWrapper.classList.remove("hidden");
    }


    updateAccountInformation();

    renderDocuments();

    renderConversations();

    updateDashboardStats();

    showView("dashboard");

}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

    const dashboardNav =
        document.getElementById("dashboardNav");

    const documentsNav =
        document.getElementById("documentsNav");

    const conversationsNav =
        document.getElementById("conversationsNav");

    const accountNav =
        document.getElementById("accountNav");


    if (dashboardNav) {

        dashboardNav.addEventListener(
            "click",
            () => showView("dashboard")
        );

    }


    if (documentsNav) {

        documentsNav.addEventListener(
            "click",
            () => showView("documents")
        );

    }


    if (conversationsNav) {

        conversationsNav.addEventListener(
            "click",
            () => showView("conversations")
        );

    }


    if (accountNav) {

        accountNav.addEventListener(
            "click",
            () => showView("account")
        );

    }


    const viewDocumentsButton =
        document.getElementById(
            "viewDocumentsButton"
        );


    if (viewDocumentsButton) {

        viewDocumentsButton.addEventListener(
            "click",
            () => showView("documents")
        );

    }


    const newConversationButton =
        document.getElementById(
            "newConversationButton"
        );


    if (newConversationButton) {

        newConversationButton.addEventListener(
            "click",
            createNewConversation
        );

    }


    const backToConversations =
        document.getElementById(
            "backToConversations"
        );


    if (backToConversations) {

        backToConversations.addEventListener(
            "click",
            () => showView("conversations")
        );

    }

}


function showView(viewName) {

    if (!currentUser) {
        return;
    }


    const views = [
        "dashboardView",
        "documentsView",
        "conversationsView",
        "accountView",
        "conversationDetailView"
    ];


    views.forEach(id => {

        const view =
            document.getElementById(id);

        if (view) {

            view.classList.add("hidden");

        }

    });


    const target =
        document.getElementById(
            viewName + "View"
        );


    if (target) {

        target.classList.remove("hidden");

    }


    const navItems = [
        "dashboardNav",
        "documentsNav",
        "conversationsNav",
        "accountNav"
    ];


    navItems.forEach(id => {

        const item =
            document.getElementById(id);

        if (item) {

            item.classList.remove("active");

        }

    });


    const activeNav =
        document.getElementById(
            viewName + "Nav"
        );


    if (activeNav) {

        activeNav.classList.add("active");

    }


    updatePageHeader(viewName);


    if (viewName === "documents") {

        renderDocuments();

    }


    if (viewName === "conversations") {

        renderConversations();

    }


    if (viewName === "dashboard") {

        updateDashboardStats();

        renderRecentDocuments();

    }

}


function updatePageHeader(viewName) {

    const eyebrow =
        document.getElementById(
            "pageEyebrow"
        );

    const title =
        document.getElementById(
            "pageTitle"
        );


    const headers = {

        dashboard: [
            "DOCUMENT INTELLIGENCE",
            "Your knowledge workspace"
        ],

        documents: [
            "DOCUMENT LIBRARY",
            "Your Documents"
        ],

        conversations: [
            "CHAT HISTORY",
            "Conversations"
        ],

        account: [
            "ACCOUNT",
            "Your Account"
        ],

        conversationDetail: [
            "CONVERSATION",
            "Conversation"
        ]

    };


    const selected =
        headers[viewName];


    if (!selected) {
        return;
    }


    if (eyebrow) {
        eyebrow.textContent = selected[0];
    }


    if (title) {
        title.textContent = selected[1];
    }

}


/* =========================================================
   DASHBOARD
========================================================= */

function setupDashboard() {

    const askButton =
        document.getElementById("askButton");


    if (askButton) {

        askButton.addEventListener(
            "click",
            askAssistant
        );

    }

}


async function askAssistant() {

    const input =
        document.getElementById(
            "questionInput"
        );


    const answerSection =
        document.getElementById(
            "answerSection"
        );


    const answerContent =
        document.getElementById(
            "answerContent"
        );


    if (!input) {
        return;
    }


    const question =
        input.value.trim();


    if (!question) {

        alert("Please enter a question.");

        return;

    }


    const askButton =
        document.getElementById(
            "askButton"
        );


    if (askButton) {

        askButton.disabled = true;

        askButton.textContent =
            "Thinking...";

    }


    if (answerSection) {

        answerSection.classList.remove(
            "hidden"
        );

    }


    if (answerContent) {

        answerContent.textContent =
            "Retrieving relevant document content and generating an answer...";

    }


    try {

        const response =
            await fetch(
                API_BASE + "/api/documents/ask",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        question: question
                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                "RAG request failed with status " +
                response.status
            );

        }


        const data =
            await response.json();


        const answer =
            data.answer ||
            "No answer was returned by the RAG service.";


        if (answerContent) {

            answerContent.textContent =
                answer;

        }


        saveConversationMessage(
            question,
            answer
        );


        renderConversations();


    } catch (error) {

        console.error(error);


        if (answerContent) {

            answerContent.textContent =
                "Unable to get an answer from the RAG service. Please make sure the Spring Boot backend and Ollama services are running.";

        }

    } finally {

        if (askButton) {

            askButton.disabled = false;

            askButton.textContent =
                "Ask Assistant →";

        }

    }

}


/* =========================================================
   CONVERSATIONS
========================================================= */

function setupConversations() {

    const conversationAskButton =
        document.getElementById(
            "conversationAskButton"
        );


    if (conversationAskButton) {

        conversationAskButton.addEventListener(
            "click",
            askConversationQuestion
        );

    }

}


function createNewConversation() {

    const conversation = {

        id: Date.now(),

        title: "New Conversation",

        createdAt:
            new Date().toISOString(),

        messages: []

    };


    conversations.unshift(
        conversation
    );


    currentConversationId =
        conversation.id;


    saveConversations();


    renderConversations();


    openConversation(
        conversation.id
    );

}


function saveConversationMessage(
    question,
    answer
) {

    let conversation =
        conversations[0];


    if (
        !conversation ||
        !conversation.messages ||
        conversation.messages.length > 0
    ) {

        conversation = {

            id: Date.now(),

            title:
                question.length > 50
                    ? question.substring(0, 50) + "..."
                    : question,

            createdAt:
                new Date().toISOString(),

            messages: []

        };


        conversations.unshift(
            conversation
        );

    }


    if (
        conversation.title ===
        "New Conversation"
    ) {

        conversation.title =
            question.length > 50
                ? question.substring(0, 50) + "..."
                : question;

    }


    conversation.messages.push({

        role: "user",

        content: question,

        timestamp:
            new Date().toISOString()

    });


    conversation.messages.push({

        role: "assistant",

        content: answer,

        timestamp:
            new Date().toISOString()

    });


    saveConversations();

}


function renderConversations() {

    const list =
        document.getElementById(
            "conversationsList"
        );


    const pageList =
        document.getElementById(
            "recentConversations"
        );


    if (list) {

        if (conversations.length === 0) {

            list.innerHTML =
                '<div class="empty-conversations">No conversations yet</div>';

        } else {

            list.innerHTML =
                conversations
                    .slice(0, 8)
                    .map(conversation => {

                        return `
                            <button
                                class="conversation-sidebar-item"
                                data-conversation-id="${conversation.id}"
                            >
                                ${escapeHtml(conversation.title)}
                            </button>
                        `;

                    })
                    .join("");


            list
                .querySelectorAll(
                    ".conversation-sidebar-item"
                )
                .forEach(button => {

                    button.addEventListener(
                        "click",
                        () => {

                            openConversation(
                                Number(
                                    button.dataset
                                        .conversationId
                                )
                            );

                        }
                    );

                });

        }

    }


    if (pageList) {

        if (conversations.length === 0) {

            pageList.innerHTML =
                '<div class="empty-conversations">No conversations yet. Click "New Conversation" to start.</div>';

        } else {

            pageList.innerHTML =
                conversations
                    .map(conversation => {

                        const date =
                            new Date(
                                conversation.createdAt
                            ).toLocaleString();


                        return `
                            <div
                                class="conversation-card"
                                data-conversation-id="${conversation.id}"
                            >

                                <h4>
                                    ${escapeHtml(conversation.title)}
                                </h4>

                                <p>
                                    ${conversation.messages.length} message${conversation.messages.length === 1 ? "" : "s"}
                                </p>

                                <small>
                                    ${escapeHtml(date)}
                                </small>

                            </div>
                        `;

                    })
                    .join("");


            pageList
                .querySelectorAll(
                    ".conversation-card"
                )
                .forEach(card => {

                    card.addEventListener(
                        "click",
                        () => {

                            openConversation(
                                Number(
                                    card.dataset
                                        .conversationId
                                )
                            );

                        }
                    );

                });

        }

    }

}


function openConversation(id) {

    const conversation =
        conversations.find(
            item => item.id === id
        );


    if (!conversation) {
        return;
    }


    currentConversationId = id;


    const title =
        document.getElementById(
            "conversationTitle"
        );


    const chatContainer =
        document.getElementById(
            "chatContainer"
        );


    if (title) {

        title.textContent =
            conversation.title;

    }


    if (chatContainer) {

        if (
            !conversation.messages ||
            conversation.messages.length === 0
        ) {

            chatContainer.innerHTML =
                `
                    <div class="empty-conversations">
                        No messages in this conversation yet.
                    </div>
                `;

        } else {

            chatContainer.innerHTML =
                conversation.messages
                    .map(message => {

                        return `
                            <div class="chat-message ${message.role}">
                                ${escapeHtml(message.content)}
                            </div>
                        `;

                    })
                    .join("");

        }

    }


    showView("conversationDetail");

}


async function askConversationQuestion() {

    const input =
        document.getElementById(
            "conversationQuestion"
        );


    const button =
        document.getElementById(
            "conversationAskButton"
        );


    if (!input) {
        return;
    }


    const question =
        input.value.trim();


    if (!question) {

        alert("Please enter a question.");

        return;

    }


    const conversation =
        conversations.find(
            item =>
                item.id === currentConversationId
        );


    if (!conversation) {
        return;
    }


    if (button) {

        button.disabled = true;

        button.textContent =
            "Thinking...";

    }


    try {

        const response =
            await fetch(
                API_BASE + "/api/documents/ask",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        question: question
                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                "Request failed with status " +
                response.status
            );

        }


        const data =
            await response.json();


        const answer =
            data.answer ||
            "No answer returned.";


        conversation.messages.push({

            role: "user",

            content: question,

            timestamp:
                new Date().toISOString()

        });


        conversation.messages.push({

            role: "assistant",

            content: answer,

            timestamp:
                new Date().toISOString()

        });


        saveConversations();


        input.value = "";


        openConversation(
            currentConversationId
        );


        renderConversations();


    } catch (error) {

        console.error(error);

        alert(
            "Unable to contact the RAG service."
        );

    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "Ask Assistant →";

        }

    }

}


/* =========================================================
   DOCUMENT UPLOAD
========================================================= */

function setupUpload() {

    const uploadButton =
        document.getElementById(
            "uploadNavigationButton"
        );


    const fileInput =
        document.getElementById(
            "fileInput"
        );


    if (uploadButton && fileInput) {

        uploadButton.addEventListener(
            "click",
            () => fileInput.click()
        );


        fileInput.addEventListener(
            "change",
            handleFileUpload
        );

    }

}


async function handleFileUpload() {

    const fileInput =
        document.getElementById(
            "fileInput"
        );


    if (!fileInput || !fileInput.files.length) {
        return;
    }


    const file =
        fileInput.files[0];


    const allowedExtensions =
        [".pdf", ".docx"];


    const lowerName =
        file.name.toLowerCase();


    const valid =
        allowedExtensions.some(
            extension =>
                lowerName.endsWith(extension)
        );


    if (!valid) {

        showUploadStatus(
            "Please upload a PDF or DOCX file.",
            true
        );

        fileInput.value = "";

        return;

    }


    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );


    showUploadStatus(
        "Uploading document..."
    );


    try {

        const response =
            await fetch(
                API_BASE +
                "/api/documents/upload",
                {
                    method: "POST",
                    body: formData
                }
            );


        if (!response.ok) {

            throw new Error(
                "Upload failed with status " +
                response.status
            );

        }


        const data =
            await response.json();


        const documentId =
            data.id ||
            data.documentId ||
            data;


        documents.unshift({

            id: documentId,

            fileName: file.name,

            uploadedAt:
                new Date().toISOString(),

            status: "Processing"

        });


        saveDocuments();


        updateDashboardStats();

        renderDocuments();

        renderRecentDocuments();


        showUploadStatus(
            "Document uploaded successfully. Document ID = " +
            documentId
        );


    } catch (error) {

        console.error(error);


        showUploadStatus(
            "Document upload failed. Make sure the Spring Boot backend is running.",
            true
        );

    }


    fileInput.value = "";

}


function showUploadStatus(
    message,
    error = false
) {

    const status =
        document.getElementById(
            "uploadStatus"
        );


    if (!status) {
        return;
    }


    status.textContent =
        message;


    status.classList.remove(
        "hidden"
    );


    if (error) {

        status.style.background =
            "#b94b4b";

    } else {

        status.style.background =
            "#17151f";

    }


    clearTimeout(
        window.uploadStatusTimer
    );


    window.uploadStatusTimer =
        setTimeout(() => {

            status.classList.add(
                "hidden"
            );

        }, 5000);

}


/* =========================================================
   DOCUMENTS
========================================================= */

function renderDocuments() {

    const grid =
        document.getElementById(
            "documentsGrid"
        );


    if (!grid) {
        return;
    }


    if (documents.length === 0) {

        grid.innerHTML =
            `
                <div class="empty-conversations">
                    No documents uploaded yet.
                </div>
            `;

        return;

    }


    grid.innerHTML =
        documents
            .map(item => {

                return `
                    <div class="document-card">

                        <h4>
                            ${escapeHtml(item.fileName)}
                        </h4>

                        <p>
                            Document ID: ${escapeHtml(String(item.id))}
                        </p>

                        <p>
                            ${escapeHtml(
                                new Date(
                                    item.uploadedAt
                                ).toLocaleString()
                            )}
                        </p>

                        <span class="document-status">
                            ${escapeHtml(item.status || "Uploaded")}
                        </span>

                    </div>
                `;

            })
            .join("");

}


function renderRecentDocuments() {

    const container =
        document.getElementById(
            "recentDocumentsList"
        );


    if (!container) {
        return;
    }


    if (documents.length === 0) {

        container.innerHTML =
            `
                <div class="empty-conversations">
                    No documents uploaded yet.
                </div>
            `;

        return;

    }


    container.innerHTML =
        documents
            .slice(0, 3)
            .map(item => {

                return `
                    <div class="document-card">

                        <h4>
                            ${escapeHtml(item.fileName)}
                        </h4>

                        <p>
                            Document ID: ${escapeHtml(String(item.id))}
                        </p>

                        <span class="document-status">
                            ${escapeHtml(item.status || "Uploaded")}
                        </span>

                    </div>
                `;

            })
            .join("");

}


function updateDashboardStats() {

    const documentCount =
        document.getElementById(
            "documentCount"
        );


    const processingCount =
        document.getElementById(
            "processingCount"
        );


    if (documentCount) {

        documentCount.textContent =
            documents.length;

    }


    if (processingCount) {

        const processing =
            documents.filter(
                item =>
                    item.status === "Processing"
            ).length;


        processingCount.textContent =
            processing;

    }

}


/* =========================================================
   ACCOUNT
========================================================= */

function setupAccount() {

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            logout
        );

    }

}


function updateAccountInformation() {

    if (!currentUser) {
        return;
    }


    const initial =
        currentUser.name
            ? currentUser.name
                .charAt(0)
                .toUpperCase()
            : "U";


    const accountName =
        document.getElementById(
            "accountName"
        );


    const accountEmail =
        document.getElementById(
            "accountEmail"
        );


    const accountAvatar =
        document.getElementById(
            "accountAvatar"
        );


    const accountLargeAvatar =
        document.getElementById(
            "accountLargeAvatar"
        );


    const accountPageName =
        document.getElementById(
            "accountPageName"
        );


    const accountPageEmail =
        document.getElementById(
            "accountPageEmail"
        );


    if (accountName) {

        accountName.textContent =
            currentUser.name;

    }


    if (accountEmail) {

        accountEmail.textContent =
            currentUser.email;

    }


    if (accountAvatar) {

        accountAvatar.textContent =
            initial;

    }


    if (accountLargeAvatar) {

        accountLargeAvatar.textContent =
            initial;

    }


    if (accountPageName) {

        accountPageName.textContent =
            currentUser.name;

    }


    if (accountPageEmail) {

        accountPageEmail.textContent =
            currentUser.email;

    }

}


function logout() {

    currentUser = null;

    localStorage.removeItem(
        "ragCurrentUser"
    );


    const appWrapper =
        document.getElementById(
            "appWrapper"
        );


    const loginPage =
        document.getElementById(
            "loginPage"
        );


    if (appWrapper) {

        appWrapper.classList.add(
            "hidden"
        );

    }


    if (loginPage) {

        loginPage.classList.remove(
            "hidden"
        );

    }


    const loginForm =
        document.getElementById(
            "loginForm"
        );


    if (loginForm) {

        loginForm.reset();

    }


    showLogin();

}


/* =========================================================
   SECURITY / DISPLAY HELPER
========================================================= */

function escapeHtml(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value == null
            ? ""
            : String(value);


    return div.innerHTML;

}