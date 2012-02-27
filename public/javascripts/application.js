( function($){

	$.extend({
		rootPath: function(){
			return '/';
    },
    showSpinner: function(){
      $('#spinner').show();
    },
    hideSpinner: function(){
      $('#spinner').hide();
    }, 
    showMajorError: function(error){
      console.log(error);
        $('<div></div>').html("There appears to have been an error.<br/><p class='error'>" + error.responseText + '</p>').dialog({
            modal: true
        }).dialog('open');
    },
    initPerPage: function(){
      $('.per_page_selector').val($.cookie('per_page') || 25);
    },
    observeListPagination: function(){
      $('.pagination a').live('click',function(e){
        var paginationTarget = $(this).closest('.search_results,.ui-widget-content');
        e.preventDefault();
        $.ajax({
          type: 'GET',
          cache: false,
          url: $(this).attr('href'),
          dataType: 'html',
          success: function(html){
            $(paginationTarget).html(html);
          }
        });
      });
      $('.per_page_selector').live('change', function(e){
        e.preventDefault();
        $.cookie('per_page',$(this).val(), {expires: 365, path: $.rootPath()});
        var paginationTarget = $(this).closest('.search_results,.ui-widget-content');
        var paginationLink = $(this).parent().next().find('a').first().attr('href').replace(/&page=\d+/,'&page=1');
        $.ajax({
          type: 'GET',
          cache: false,
          url: paginationLink,
          dataType: 'html',
          success: function(html){
            $(paginationTarget).html(html);
          }
        });
      });
    },
    observeDialogShow: function(rootClass){
      $(rootClass).live('click',function(e){
        e.preventDefault();
        var windowTitle = $(this).attr('title');
        $.ajax({
          cache: false,
          dataType: 'html',
          url: $(this).attr('href'),
          success: function(html){
            var dialogNode = $('<div><div id="dialog-error" class="error" style="display:none;"></div><div id="dialog-notice" class="notice" style="display:none;"></div></div>');
            $(dialogNode).append(html);
            $(dialogNode).dialog({
              modal: true,
              width: 600,
              minWidth: 400,
              height: 'auto',
              position: 'top',
              title: windowTitle,
              buttons: {
                Close: function(){
                  $(dialogNode).dialog('close');
                  $(dialogNode).remove();
                },
              }
            });
            $('.tabs').tabs({
              cookie: {
                expires: 3
              },
              ajaxOptions: {
                cache: false,
                dataType: 'html',
                beforeSend: function(){
                  $.showSpinner();
                },
                complete: function(){
                  $.initPerPage();
                  $.hideSpinner();
                },
                error: function(error){
                  $.showMajorError(error);
                }
              }
            });
          }
        });
      });
    },
    submitTagFilter: function(href,filter_type,tag_id,new_tag){
      $.ajax({
        dataType: 'html',
        cache: false,
        url: href,
        type: 'post',
        data: {filter_type: filter_type, tag_id: tag_id, new_tag: new_tag},
        success: function(html){
         alert(html);
        }
      });
    },
    bindHoverRows: function(){
      $('.hover_row').hoverIntent(
        function(){
          $(this).addClass('over');
        },
        function(){
          $(this).removeClass('over');
        }
      );
    },
    observeTagCloudControls: function(){
      $('#reset_filter').click(function(e){
        $('.tag').show();
      });
      var filterStuff = function(e){
        if(e != ''){
          e.preventDefault();
        }
        $('a.tag').show();
        var filterVal = $('#filter_by').val();
        var filterregex = new RegExp(filterVal,'i');
        $('a.tag').each(function(){
          if(! $(this).html().match(filterregex)){
            $(this).hide();
          }
        });
      };
      $('#filter_button').click(filterStuff);
      $('#filter_by').observe_field(1,filterStuff);

      $('#tag_slider').slider({
        value: 0,
        min: 0,
        max: 9,
        step: 1,
        slide: function(event, ui){
          $('.tag').show();
          for(var i = 1; i <= ui.value; i=i+1){
            $('.s' + i).hide();
          }
        }
      });
    },
    observeTagAutocomplete: function(hubId, rootId){
      function split( val ) {
        return val.split( /,\s*/ );
      }
      function extractLast( term ) {
        return split( term ).pop();
      }
      $( rootId )
      .bind( "keydown", function( event ) {
        if ( event.keyCode === $.ui.keyCode.TAB &&
        $( this ).data( "autocomplete" ).menu.active ) {
          event.preventDefault();
        }
      })
      .autocomplete({
        source: function( request, response ) {
          $.getJSON( $.rootPath() + 'hubs/' + hubId + '/tags/autocomplete', {
            term: extractLast( request.term )
          }, response );
        },
        search: function() {
          // custom minLength
          var term = extractLast( this.value );
          if ( term.length < 2 ) {
            return false;
          }
        },
        focus: function() {
          // prevent value inserted on focus
          return false;
        },
        select: function( event, ui ) {
          var terms = split( this.value );
          // remove the current input
          terms.pop();
          // add the selected item
          terms.push( ui.item.value );
          // add placeholder to get the comma-and-space at the end
          terms.push( "" );
          this.value = terms.join( ", " );
          return false;
        }
      });
    }

  
});

})(jQuery);

$(document).ready(function(){

  $.ajaxSetup({
    cache: false,
    beforeSend: function(){
      $.showSpinner();
    },
    complete: function(){
      $.initPerPage();
      $.hideSpinner();
    },
    error: function(error){
      $.showMajorError(error);
    },
  });

  jQuery.bt.options.ajaxCache = false;
  jQuery.bt.options.fill = '#dddddd';
  jQuery.bt.options.strokeWidth = 2;
  jQuery.bt.options.strokeStyle = '#333';
  jQuery.bt.options.textzIndex = 999;
  jQuery.bt.options.boxzIndex = 998;
  jQuery.bt.options.wrapperzIndex = 997;
  jQuery.bt.options.postShow = function(){
    $.hideSpinner();
  };

  $('.hub_tabs').tabs({
    cookie: {
      expires: 3 
    },
    ajaxOptions: {
      beforeSend: function(){
        $.showSpinner();
      },
      error: function(error){
        $.showMajorError(error);
      },
      complete: function(){
        $.initPerPage();
        $.hideSpinner();
        $('#add_feed_to_hub').ajaxForm({
          dataType: 'html',
          beforeSend: function(){
            $.showSpinner();
            $('.add_feed_container .messages').html('');
          },
          complete: function(){
            $.hideSpinner();
          },
          success: function(html){
            $('.add_feed_container .messages').append('<div class="notice">' + html + '</div>');
            // Update the feed list.
            var current_index = $('.hub_tabs').tabs('option','selected');
            $('.hub_tabs').tabs('load',current_index);
          },
          error: function(jqXHR){
            $('.add_feed_container .messages').append('<div class="error">' + jqXHR.responseText + '</div>');
          }
        });
      }
    }
  });

  $.bindHoverRows();

  $('.toggler').bind({
    mouseover: function(){
      $(this).css({cursor: 'pointer', textDecoration: 'underline'})
    },
    mouseout: function(){
      $(this).css({textDecoration: 'none'})
    },
    click: function(e){
      e.preventDefault();
      var targetId = '#' + $(this).attr('id') + '-target';
      if($(targetId).is(':visible')){
        $(targetId).hide('medium');
        $(this).find('.toggler-indicator').attr('class', 'toggler-indicator ui-silk ui-silk-arrow-right inline');
      } else {
        $(this).find('.toggler-indicator').attr('class', 'toggler-indicator ui-silk ui-silk-arrow-down inline');
        $(targetId).show('medium');
        if($(this).hasClass('remove_after_toggling')){
          $(this).remove();
        }
        
      }
    }
  });


/*  $('.more').live({
    mouseover: function(){
      $(this).css('cursor','pointer');
    },
    click: function(e){
      e.preventDefault();
      var id = $(this).attr('id').split('_')[3];
      if($(this).attr('id').match(/republished/)){
        $('#republished_feed_metadata_' + id).toggle('medium');
      } else{
        $('#hub_feed_metadata_' + id).toggle('medium');
      }
    }
  });
  */
  // For tabs that need minimal options.
  $('.tabs').tabs({
    cookie: {
      expires: 3
    },
    ajaxOptions: {
      cache: false,
      dataType: 'html',
      beforeSend: function(){
        $.showSpinner();
      },
      complete: function(){
        $.initPerPage();
        $.hideSpinner();
      },
      error: function(error){
        $.showMajorError(error);
      }
    }
  });

  if($('#logged_in').length > 0){
    $('.tag').live({
      click: function(e){
        e.preventDefault();

        var tag_id = $(this).attr('data_tag_id') || 0;
        var hub_id = $(this).attr('data_hub_id') || 0;
        var hub_feed_id = $(this).attr('data_hub_feed_id') || 0;
        var hub_feed_item_id = $(this).attr('data_hub_feed_item_id') || 0;
        
        $(this).bt({
          ajaxPath: $.rootPath() + 'hubs/' + hub_id + '/tag_controls/?tag_id=' + tag_id + '&hub_feed_id=' + hub_feed_id + '&hub_feed_item_id=' + hub_feed_item_id,
          trigger: 'none',
          closeWhenOthersOpen: true,
          clickAnywhereToClose: true
        });
        $(this).btOn();
      }
    });
    $('.add_filter_control').live({
      click: function(e){
        e.preventDefault();
        var tag_id = $(this).attr('data_id');
        var filter_type = $(this).attr('data_type');
        var filter_href = $(this).attr('href');
        if(filter_type == 'ModifyTagFilter' || (filter_type == 'AddTagFilter' && tag_id == undefined)){
          var dialogNode = $('<div><div id="dialog-error" class="error" style="display:none;"></div><div id="dialog-notice" class="notice" style="display:none;"></div></div>');
          $(dialogNode).append('<h2>Please enter the replacement tag</h2><input type="text" id="new_tag_for_filter" size="40" />');
          $(dialogNode).dialog({
            modal: true,
            width: 600,
            minWidth: 400,
            height: 'auto',
            position: 'top',
            title: '',
            buttons: {
              Close: function(){
                $(dialogNode).dialog('close');
                $(dialogNode).remove();
              },
              Submit: function(){
                $.submitTagFilter(filter_href, filter_type, tag_id, $('#new_tag_for_filter').val());
                $(dialogNode).dialog('close');
                $(dialogNode).remove();
              }
            }
          });
          return false;
        }
        $.submitTagFilter($(this).attr('href'), filter_type, tag_id,'');
      }
    });
  }

  $('.control').live({
    click: function(e){
      e.preventDefault();
      var id = $(this).attr('id');
      $(this).bt({
        trigger: 'none',
        contentSelector: $('#' + id + '-target'),
        closeWhenOthersOpen: true
      });
      $(this).btOn();
    }
  });

  $('.hub_feed_more_control,.republished_feed_more_control').live({
    click: function(e){
      e.preventDefault();
      if($(this).hasClass('more_details_included')){
        return;
      }
      var elem = this;
      $.ajax({
        cache: false,
        url: $(this).attr('href'),
        success: function(html){
          $(elem).addClass('more_details_included');
          $(elem).closest('tr').after(html);
        }
      });
    }
  });

  $('#hub_search_form,#hub_tag_search_form').live({
    submit: function(e){
      e.preventDefault();
      $(this).ajaxSubmit({
        success: function(html){
          $('#hub_search_form').closest('.ui-widget-content').html(html);
          $.bindHoverRows();
        }
      });
    }
  });

  $.observeDialogShow('.dialog-show');

  $('a.add_item_source_to_custom_republished_feed,a.remove_item_source_from_custom_republished_feed').live({
    click: function(e){
      $('body').data('item_source_id_for_republishing', $(this).attr('data_item_id'));
      $('body').data('item_source_type_for_republishing', $(this).attr('data_item_type'));
      if($(this).hasClass('add_item_source_to_custom_republished_feed')){
        $('body').data('item_effect_for_republishing', 'add');
      } else {
        $('body').data('item_effect_for_republishing', 'remove');
      }
    }
  });

  $('a.choose_republished_feed').live({
    click: function(e){
      e.preventDefault();
      var republished_feed_id = $(this).attr('data_id');
      var item_source_id = $('body').data('item_source_id_for_republishing');
      var item_source_type = $('body').data('item_source_type_for_republishing');
      var item_effect = $('body').data('item_effect_for_republishing');
      // TODO - make this emit when it's been added.
      $.ajax({
        cache: false,
        dataType: 'html',
        url: $.rootPath() + 'input_sources',
        type: 'post',
        data:{ input_source: {republished_feed_id: republished_feed_id, item_source_type: item_source_type, item_source_id: item_source_id, effect: item_effect}},
        beforeSend: function(){ 
          $.showSpinner();
          $('#dialog-error,#dialog-notice').html('').hide();
        },
        complete: function(){ $.hideSpinner();},
        success: function(html){
          $('#dialog-notice').show().html(html);
        },
        error: function(jqXHR, textStatus, errorThrown){
          console.log(jqXHR);
          console.log(textStatus);
          console.log(errorThrown);
          $('#dialog-error').show().html(jqXHR.responseText);
        }

      });

    }
  });
  $.observeListPagination();

});
