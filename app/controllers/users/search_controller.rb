# frozen_string_literal: true

module Users
  # Provides JSON api for searching User records
  class SearchController < ApplicationController
    before_action :authenticate_user!

    after_action :verify_authorized

    # Return an array of objects formatted for jQuery UI's Autocomplete
    def autocomplete
      authorize User

      search = Sunspot.search(User) { fulltext params[:term], fields: %i[email username] }

      results = search.results.map do |user|
        {
          label: "#{user.username} (#{user.email})",
          value: user.id
        }
      end

      render json: results
    end
  end
end
