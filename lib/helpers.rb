module Helpers
  def nav_link_to(link_text, url, options)
    if options[:section] == current_page.data.section
      options[:class] = 'main-nav__link main-nav__link--active'
    else
      options[:class] = 'main-nav__link'
    end
    link_to link_text, url, options
  end

  def title
    "#{current_page.data.title} / Lunge Manufaktur"
  end

  def meta_keywords
    current_page.data.keywords
  end

  def meta_description
    current_page.data.description || 'Lauf- und Bequemschuhe aus deutscher Fertigung.'
  end
end
