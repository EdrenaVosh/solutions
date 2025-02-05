// Data configuration
const CATEGORIES_CONFIG = {
  Sales: {
    name: "Sales",
    options: [
      { id: "sales_proposals", label: "Sales Proposals", weight: 1 },
      { id: "sales_contracts", label: "Sales Contracts", weight: 1 },
      {
        id: "sales_marketing",
        label: "Sales & Marketing Collaterals",
        weight: 1,
      },
      { id: "service_agreements", label: "Service Agreements", weight: 1 },
      { id: "invoices", label: "Invoices", weight: 1 },
      { id: "sales_ndas", label: "NDAs", weight: 1 },
    ],
  },
  HR: {
    name: "HR",
    options: [
      { id: "employment_contracts", label: "Employment Contracts", weight: 1 },
      {
        id: "compensation_forms",
        label: "Compensation Change Forms",
        weight: 1,
      },
      { id: "offer_letters", label: "Offer Letters", weight: 1 },
      {
        id: "candidate_applications",
        label: "Candidate Applications",
        weight: 1,
      },
      {
        id: "contractor_agreements",
        label: "Contractor Agreements",
        weight: 1,
      },
      { id: "hr_government_forms", label: "Government Forms", weight: 1 },
      { id: "compliance_policies", label: "Compliance Policies", weight: 1 },
      { id: "hr_ndas", label: "NDAs", weight: 1 },
    ],
  },
  "Forms & Agreements": {
    name: "Forms & Agreements",
    options: [
      {
        id: "other_compliance_policies",
        label: "Compliance Policies",
        weight: 1,
      },
      { id: "liability_waivers", label: "Liability Waivers", weight: 1 },
      { id: "other_ndas", label: "NDAs", weight: 1 },
      { id: "service_requests", label: "Service Requests", weight: 1 },
      { id: "purchase_orders", label: "Purchase Orders", weight: 1 },
      { id: "other_government_forms", label: "Government Forms", weight: 1 },
      { id: "tax_forms", label: "Tax Forms", weight: 1 },
      { id: "vendor_agreements", label: "Vendor Agreements", weight: 1 },
    ],
  },
};

const DEFAULT_CATEGORY = "Sales";

class CategoryManager {
  constructor() {
    this.selectedOptions = new Set();
    this.init();
  }

  init() {
    this.renderCategories();
    this.updatePrimaryCategory();
  }

  // Calculation methods
  getOptionWeight(categoryOptions, optionId) {
    const option = categoryOptions.find((opt) => opt.id === optionId);
    return option ? option.weight : 0;
  }

  calculateCategoryScore(categoryOptions) {
    return Array.from(this.selectedOptions).reduce(
      (score, selectedId) =>
        score + this.getOptionWeight(categoryOptions, selectedId),
      0
    );
  }

  getSelectedCountForCategory(categoryOptions) {
    return categoryOptions.reduce(
      (count, option) => count + (this.selectedOptions.has(option.id) ? 1 : 0),
      0
    );
  }

  calculateCategoryStats() {
    return Object.entries(CATEGORIES_CONFIG).reduce(
      (stats, [categoryName, category]) => {
        stats[categoryName] = {
          selectedCount: this.getSelectedCountForCategory(category.options),
          totalWeight: this.calculateCategoryScore(category.options),
        };
        return stats;
      },
      {}
    );
  }

  // Primary category determination
  getPrimaryCategoryInfo(stats) {
    const maxWeight = Math.max(
      ...Object.values(stats).map((s) => s.totalWeight)
    );

    if (maxWeight === 0) {
      return {
        name: DEFAULT_CATEGORY,
        selectedCount: 0,
        totalWeight: 0,
      };
    }

    const primaryCategories = Object.entries(stats)
      .filter(([_, data]) => data.totalWeight === maxWeight)
      .map(([category, data]) => ({
        name: category,
        ...data,
      }));

    return primaryCategories[0];
  }

  // UI rendering methods
  renderCategoryStats(stats, primaryCategory) {
    return Object.entries(stats)
      .map(([catName, data]) =>
        this.renderStatItem(catName, data, primaryCategory)
      )
      .join("");
  }

  renderStatItem(categoryName, data, primaryCategory) {
    const isPrimary = categoryName === primaryCategory.name;
    const weightInfo =
      data.totalWeight > 1 ? ` (total weight: ${data.totalWeight})` : "";

    return `
      <div class="stat-item ${isPrimary ? "primary" : ""}">
        <strong>${categoryName}:</strong> ${
      data.selectedCount
    } selected${weightInfo}
      </div>
    `;
  }

  renderPrimaryCategorySection(primaryCategory, stats) {
    const topOptions = this.getTopWeightedOptions(
      CATEGORIES_CONFIG[primaryCategory.name].options
    );

    return `
      <div>
        <h2>Primary Workspace: <span>${primaryCategory.name}</span></h2>
        <p>Selected options by category:</p>
        <div class="category-stats">
          ${this.renderCategoryStats(stats, primaryCategory)}
        </div>
        ${this.renderWelcomeTemplates(topOptions)}
      </div>
    `;
  }

  renderWelcomeTemplates(topOptions) {
    if (topOptions.length === 0) return "";

    return `
      <div class="welcome-templates">
        <h3>Welcome Screen Templates for ${
          this.getPrimaryCategoryInfo(this.calculateCategoryStats()).name
        } Workspace</h3>
        <div class="template-options">
          ${topOptions
            .map(
              (option) => `
            <div class="template-option ${
              this.selectedOptions.has(option.id) ? "selected" : ""
            }">
              <span class="template-label">${option.label}</span>
              <div class="template-info">
                ${
                  this.selectedOptions.has(option.id)
                    ? '<span class="template-selected">Selected</span>'
                    : ""
                }
                <span class="template-weight">(weight: ${option.weight})</span>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  renderCategoryOptions(category) {
    return category.options
      .map((option) => this.renderOptionCheckbox(option))
      .join("");
  }

  renderOptionCheckbox(option) {
    const isChecked = this.selectedOptions.has(option.id);
    return `
      <div class="option">
        <input 
          type="checkbox" 
          id="${option.id}" 
          ${isChecked ? "checked" : ""}
        >
        <label for="${option.id}">${option.label}</label>
        <input 
          type="number" 
          class="weight-input" 
          value="${option.weight}"
          min="0"
          step="0.1"
          data-option-id="${option.id}"
        >
      </div>
    `;
  }

  // Event handlers
  handleCheckboxChange(optionId, checked) {
    if (checked) {
      this.selectedOptions.add(optionId);
    } else {
      this.selectedOptions.delete(optionId);
    }
    this.updatePrimaryCategory();
  }

  handleWeightChange(optionId, newWeight) {
    // Find and update the option weight in CATEGORIES_CONFIG
    Object.values(CATEGORIES_CONFIG).forEach((category) => {
      const option = category.options.find((opt) => opt.id === optionId);
      if (option) {
        option.weight = parseFloat(newWeight) || 0;
      }
    });

    this.updatePrimaryCategory();
  }

  // Main update methods
  updatePrimaryCategory() {
    const stats = this.calculateCategoryStats();
    const primaryCategory = this.getPrimaryCategoryInfo(stats);

    document.getElementById("primaryCategory").innerHTML =
      this.renderPrimaryCategorySection(primaryCategory, stats);
  }

  getTopWeightedOptions(categoryOptions, count = 3) {
    return [...categoryOptions]
      .sort((a, b) => {
        // First, sort by selection status
        const aSelected = this.selectedOptions.has(a.id);
        const bSelected = this.selectedOptions.has(b.id);

        if (aSelected !== bSelected) {
          return bSelected ? 1 : -1; // Selected items come first
        }

        // If selection status is the same, sort by weight
        return b.weight - a.weight;
      })
      .slice(0, count);
  }

  renderCategories() {
    const container = document.getElementById("categoriesContainer");
    container.innerHTML = "";

    Object.entries(CATEGORIES_CONFIG).forEach(([_, category]) => {
      const categoryDiv = document.createElement("div");
      categoryDiv.className = "category";
      categoryDiv.innerHTML = `
        <h2>${category.name}</h2>
        <div class="options">
          ${this.renderCategoryOptions(category)}
        </div>
      `;

      this.attachCheckboxListeners(categoryDiv);
      container.appendChild(categoryDiv);
    });
  }

  attachCheckboxListeners(categoryDiv) {
    categoryDiv
      .querySelectorAll('input[type="checkbox"]')
      .forEach((checkbox) => {
        checkbox.addEventListener("change", (e) => {
          this.handleCheckboxChange(e.target.id, e.target.checked);
        });
      });

    // Add weight input listeners
    categoryDiv
      .querySelectorAll('input[type="number"].weight-input')
      .forEach((input) => {
        input.addEventListener("change", (e) => {
          const optionId = e.target.dataset.optionId;
          this.handleWeightChange(optionId, e.target.value);
        });
      });
  }
}

// Initialize when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new CategoryManager();
});
