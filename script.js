let dataSet = [];
let filteredData = [];
let sortColumn = null;
let sortDirection = 'asc';

async function fetchData() {
    try {
        const response = await fetch('MasterData.csv');
        const csvText = await response.text();
        const parsedData = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true
        });

        dataSet = parsedData.data.map(row => ({
            category: row['Category']?.trim() || '',
            partNumber: row['Part Number']?.trim() || '',
            subCategory: row['Sub Category']?.trim() || '',
            stockUnit: row['Stock Unit']?.trim() || '',
            totalMaterialCost: row['Total Material Cost']?.trim() || '',
            description: row['Description']?.trim() || ''
        }));

        populateFilters();
        filterData();
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function populateFilters() {
    populateDropdown('category', 'category');
    updateSubCategoryDropdown();
    populateDropdown('stockUnit', 'stockUnit');
}

function populateDropdown(elementId, property) {
    const dropdown = document.getElementById(elementId);
    dropdown.innerHTML = `<option value="">All ${property.replace(/([A-Z])/g, ' $1')}</option>`;
    const options = [...new Set(dataSet.map(row => row[property]).filter(Boolean))].sort();

    options.forEach(optionValue => {
        const option = document.createElement('option');
        option.value = optionValue;
        option.textContent = optionValue;
        dropdown.appendChild(option);
    });
}

function updateSubCategoryDropdown() {
    const category = document.getElementById('category').value.toLowerCase();
    const subCategoryDropdown = document.getElementById('subCategory');
    const currentSubCategory = subCategoryDropdown.value; // Preserve current selection
    subCategoryDropdown.innerHTML = '<option value="">All Sub Categories</option>';

    const filteredSubCategories = [
        ...new Set(
            dataSet
                .filter(row => !category || row.category.toLowerCase() === category)
                .map(row => row.subCategory)
                .filter(Boolean)
        ),
    ].sort();

    filteredSubCategories.forEach(subCategory => {
        const option = document.createElement('option');
        option.value = subCategory;
        option.textContent = subCategory;
        subCategoryDropdown.appendChild(option);
    });

    if (filteredSubCategories.includes(currentSubCategory)) {
        subCategoryDropdown.value = currentSubCategory;
    } else {
        subCategoryDropdown.value = ""; 
    }
}

function filterData() {
    const search = document.getElementById("search").value.toLowerCase();
    const partNumberSearch = document.getElementById("partNumberSearch").value.toLowerCase();
    const category = document.getElementById("category").value.toLowerCase();
    const subCategory = document.getElementById("subCategory").value.toLowerCase();
    const stockUnit = document.getElementById("stockUnit").value.toLowerCase();

    filteredData = dataSet.filter(row => {
        const matchesCategory = !category || row.category.toLowerCase() === category;
        const matchesSubCategory = !subCategory || row.subCategory.toLowerCase() === subCategory;
        const matchesStockUnit = !stockUnit || row.stockUnit.toLowerCase() === stockUnit;
        const matchesPartNumber = !partNumberSearch || row.partNumber.toLowerCase().includes(partNumberSearch);
        const matchesSearch = !search || row.description.toLowerCase().includes(search);
        return matchesCategory && matchesSubCategory && matchesStockUnit && matchesPartNumber && matchesSearch;
    });

    updateSubCategoryDropdown();
    displayData(filteredData);
}

function resetFilters() {
    document.getElementById("category").value = "";
    document.getElementById("subCategory").value = "";
    document.getElementById("stockUnit").value = "";
    document.getElementById("partNumberSearch").value = "";
    document.getElementById("search").value = "";
    sortColumn = null;
    sortDirection = 'asc';
    populateFilters();
    filterData();
}

function displayData(data) {
    const tableBody = document.getElementById("table-body");
    tableBody.innerHTML = "";

    const searchTerm = document.getElementById("search").value.toLowerCase();
    const partNumberSearchTerm = document.getElementById("partNumberSearch").value.toLowerCase();

    data.forEach(row => {
        const tr = document.createElement("tr");

        const highlightedDescription = highlightText(row.description, searchTerm);
        const highlightedPartNumber = highlightText(row.partNumber, partNumberSearchTerm);

        tr.innerHTML = `
            <td>${row.category}</td>
            <td>${highlightedPartNumber}</td>
            <td>${row.subCategory}</td>
            <td>${row.stockUnit}</td>
            <td>${row.totalMaterialCost}</td>
            <td>${highlightedDescription}</td>
        `;
        tableBody.appendChild(tr);
    });
}

function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

fetchData();
