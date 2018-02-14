# frozen_string_literal: true

xml.instruct! :xml, version: '1.0'
xml.rss(
  :version => '2.0',
  'xmlns:content' => 'http://purl.org/rss/1.0/modules/content/',
  'xmlns:dc' => 'http://purl.org/dc/elements/1.1/'
) do
  xml.channel do
    xml.title @hub_feed.title
    xml.description @hub_feed.description
    xml.link hub_hub_feed_url(@hub, @hub_feed)
    xml.generator Tagteam::Application.config.rss_generator

    @feed_items.each do |item|
      xml.item do
        xml.title item.title
        xml.description item.description if item.description.present?
        xml.tag!('content:encoded', item.content) if item.content.present?
        if item.date_published.present?
          xml.pubDate item.date_published.to_s(:rfc822)
        end
        xml.link item.url
        xml.guid item.guid
        xml.author item.authors
        item.all_tags_on(@hub_feed.hub.tagging_key).each do |tag|
          xml.category @hub_feed.hub.tag_prefix.blank? ? tag.name : tag.name_prefixed_with(@hub_feed.hub.tag_prefix)
        end
        xml.tag!('dc:rights', item.rights) if item.rights.present?
        if item.contributors.present?
          xml.tag!('dc:contributor', item.contributors)
        end
      end
    end
  end
end
