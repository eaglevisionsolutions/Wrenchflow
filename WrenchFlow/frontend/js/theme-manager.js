const THEME_API_URL = '/api/themes'; // Backend API endpoint for themes
const USER_API_URL = '/api/users'; // Backend API endpoint for user preferences
const shopUserId = 1; // Replace with the actual logged-in shop_user_id

// Fetch and display themes for Platform Admins
async function fetchThemes() {
    try {
        const response = await fetch(THEME_API_URL);
        const themes = await response.json();
        const themesTableBody = document.getElementById('themesTableBody');
        themesTableBody.innerHTML = ''; // Clear existing rows

        themes.forEach(theme => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${theme.theme_name}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editTheme(${theme.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteTheme(${theme.id})">Delete</button>
                </td>
            `;
            themesTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching themes:', error);
    }
}

// Save a new or edited theme
document.getElementById('themeForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const themeId = document.getElementById('themeId').value;
    const themeName = document.getElementById('themeName').value;
    const themeConfig = document.getElementById('themeConfig').value;

    const themeData = {
        id: themeId || null,
        theme_name: themeName,
        theme_config: JSON.parse(themeConfig),
    };

    try {
        const response = await fetch(THEME_API_URL, {
            method: themeId ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(themeData),
        });

        if (response.ok) {
            alert('Theme saved successfully!');
            document.getElementById('themeForm').reset();
            fetchThemes();
        } else {
            console.error('Failed to save theme:', await response.json());
        }
    } catch (error) {
        console.error('Error saving theme:', error);
    }
});

// Edit a theme
async function editTheme(themeId) {
    try {
        const response = await fetch(`${THEME_API_URL}?id=${themeId}`);
        const theme = await response.json();

        document.getElementById('themeId').value = theme.id;
        document.getElementById('themeName').value = theme.theme_name;
        document.getElementById('themeConfig').value = JSON.stringify(theme.theme_config, null, 2);
    } catch (error) {
        console.error('Error fetching theme:', error);
    }
}

// Delete a theme
async function deleteTheme(themeId) {
    if (!confirm('Are you sure you want to delete this theme?')) return;

    try {
        const response = await fetch(`${THEME_API_URL}?id=${themeId}`, { method: 'DELETE' });

        if (response.ok) {
            alert('Theme deleted successfully!');
            fetchThemes();
        } else {
            console.error('Failed to delete theme:', await response.json());
        }
    } catch (error) {
        console.error('Error deleting theme:', error);
    }
}

// Fetch and display themes for Shop Users
async function fetchUserThemes() {
    try {
        const response = await fetch(THEME_API_URL);
        const themes = await response.json();
        const themeSelect = document.getElementById('themeSelect');
        themeSelect.innerHTML = ''; // Clear existing options

        themes.forEach(theme => {
            const option = document.createElement('option');
            option.value = theme.id;
            option.textContent = theme.theme_name;
            themeSelect.appendChild(option);
        });

        // Fetch the user's current theme preference
        const userResponse = await fetch(`${USER_API_URL}/${shopUserId}`);
        const user = await userResponse.json();
        if (user.selected_theme_id) {
            themeSelect.value = user.selected_theme_id;
        }
    } catch (error) {
        console.error('Error fetching user themes:', error);
    }
}

// Save the user's theme preference
document.getElementById('themeSelectionForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const selectedThemeId = document.getElementById('themeSelect').value;

    try {
        const response = await fetch(`${USER_API_URL}/${shopUserId}/theme`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ selected_theme_id: selectedThemeId }),
        });

        if (response.ok) {
            alert('Theme preference saved successfully!');
            applyTheme(selectedThemeId);
        } else {
            console.error('Failed to save theme preference:', await response.json());
        }
    } catch (error) {
        console.error('Error saving theme preference:', error);
    }
});

// Apply a theme dynamically
async function applyTheme(themeId) {
    try {
        const response = await fetch(`${THEME_API_URL}?id=${themeId}`);
        const theme = await response.json();

        // Apply theme configuration (e.g., CSS variables)
        const root = document.documentElement;
        Object.entries(theme.theme_config).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });
    } catch (error) {
        console.error('Error applying theme:', error);
    }
}

// Initialize the theme manager
if (document.getElementById('themesTableBody')) {
    fetchThemes(); // For Platform Admins
} else if (document.getElementById('themeSelect')) {
    fetchUserThemes(); // For Shop Users
}