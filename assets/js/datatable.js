function DataTable(data) {
    this.table_container = $('<div class="ld-datatable-container"></div>');
    this.table = $(data.table);
    this.table_header = $('thead', this.table);
    this.table_header = $('<table class="ld-datatable-header"></table').append(this.table_header);
    this.table_header_container = $('<div class="ld-datatable-header-container"></div>');
    this.table_header_container.append(this.table_header);
    
    this.table.addClass('ld-datatable');
    // this.table.parent().css('overflow-x', 'auto');
    if (data.ajax) {
        this.ajax = data.ajax;
    } else {
        this.ajax = ''
    }
    var min_width = this.table.parent().width();
    this.table_container.css('max-width', min_width);
    this.table_container.css('overflow-x', 'auto');
    this.table_container.appendTo(this.table.parent());
    this.table_container.append(this.table);
    this.table_header_container.css('max-width', min_width);
    this.table_header_container.css('overflow-x', 'hidden');
    this.table_header_container.insertBefore(this.table_container);
    this.start_pos = 0;
    this.draw = 0;
    this.loading_container = $('<div class="ld-datatable-loading-container"></div>');
    this.loading = $('<div class="ld-datatable-loading"></div>');
    this.loading_container.append(this.loading);
    var height = this.table_container.height();
    this.loading_container.height(height);
    this.table_container.append(this.loading_container);
    var loadingTimeout;
    this.loading_container.hide()
    .ajaxStart(function() {
        var element = $(this);
        loadingTimeout = setTimeout(function() {
           element.show();
        }, 500);
    })
    .ajaxStop(function() {
        clearTimeout(loadingTimeout);
        $(this).hide();
    });;
    this.table_container.append(this.loading_container);
    if (data.hide) {
        this.hide = data.hide;
    } else {
        this.hide = [];
    }
    if (data.pagination) {
        this.amount_per_page = data.pagination
    } else {
        this.amount_per_page = 40;
    }

    if (data.data) {
        this.data = data.data;
    } else {
        this.data = {};
    }

    if (data.filter) {
        this.filter = data.filter;
    } else {
        this.filter = {};
    }

    if (data.sort) {
        this.sort = data.sort;
    } else {
        this.sort = {};
    }

    if (data.row_height) {
        this.row_height = data.row_height
    } else {
        this.row_height = 40
    }

    this.move = $('<span class="ui-icon ui-icon-arrow-4 ld-datatable-move-handle"></span>');
    this.moving_flag = false;

    this.resize = $('<span class="ld-datatable-resize-handle"></span>');
    this.resizing_flag = false;

    this.ghost = $('<div class="ld-datatable-move-ghost-placeholder"><span class="title"></span></div>');
    this.ghost.css('position', 'absolute');
    this.ghost.css('z-index', '40');
    var that = this;

    $.post(
        that.ajax, {
        start_pos: that.start_pos,
        limit: that.amount_per_page,
        filter: that.filter,
        draw: that.draw
    },
        function (data) {
            that.data = data;
            that.render(data);
            var div = $('<div class="ld-datatable-scroller"></div');
            var height = that.data.info.total_amount * that.row_height;
            div.height(height);
            that.table_container.append(div);
            var tr = $('tr', that.table).eq(0);
            var thead_ths = $('th', that.table_header);
            var tds = $('td', tr);
            for(var i = 0; i < tds.length; i ++) {
                var width = tds.eq(i).width();
                if (width < 80) {
                    width = 80;    
                }
                thead_ths.eq(i).width(width);
            }
            that.table.css('table-layout', 'fixed');
            that.table_container.css('table-layout', 'fixed');
            // if ( that.table_container.get(0).scrollHeight > that.table_container.height() ) {
            //     that.table_header.css('padding-right', '18px');
            // }
        }
    )

    that.table_header.on('mouseover', 'th:not(.ld-datatable-fixed)', function () {
        $(this).prepend(that.move);
        $(this).append(that.resize);
    });
    that.table_header.on('mouseleave', 'th:not(.ld-datatable-fixed)', function () {
        that.move.remove();
        that.resize.remove();
    });

    that.table_header.on('mouseover', 'th.ld-datatable-fixed', function () {
        $(this).append(that.resize);
    });
    that.table_header.on('mouseleave', 'th.ld-datatable-fixed', function () {
        that.resize.remove();
    });

    that.table_header.on('mouseover', '.ld-datatable-resize-handle', function () {
        that.resize.css('opacity', 1);
        that.resize.css('cursor', 'col-resize');
    });
    that.table_header.on('mouseleave', '.ld-datatable-resize-handle', function () {
        that.resize.css('opacity', 0);
        that.resize.css('cursor', 'auto');
    });

    that.table_header.on('mouseover', '.ld-datatable-move-handle', function () {
        that.move.css('cursor', 'pointer');
    });
    that.table_header.on('mouseleave', '.ld-datatable-move-handle', function () {
        that.move.css('cursor', 'auto');
    });

    that.table_container.on('scroll', function (e) {
        that.loading_container.css('top', $(this).scrollTop());
        var left = $(this).scrollLeft();
        that.table_header_container.scrollLeft(left);
        if (left > 0) {
            $('.ld-datatable-fixed', that.table).css('opacity', '0.7');
            $('.ld-datatable-fixed', that.table_header).css('opacity', '0.7');
        } else {
            $('.ld-datatable-fixed', that.table).css('opacity', '1');
            $('.ld-datatable-fixed', that.table_header).css('opacity', '1');
        }
        if (that.ajax) {
            var top = $(this).scrollTop();

            var position = Math.floor((top / 38));
            if( that.start_pos !=  Math.floor(position / 10)) {
                if (position > that.data.info.total_amount - Math.floor(that.amount_per_page / 2 - 10)) 
                    that.table.css('top', ((that.data.info.total_amount - that.amount_per_page) * that.row_height) + 'px');
                else if(position > Math.floor(that.amount_per_page / 2)) {
                    that.table.css('top', (top - (Math.floor(that.amount_per_page / 2) * that.row_height)) + 'px');
                }
                else
                    that.table.css('top', 0 + 'px');
                that.draw += 1;
                that.table_container.append(that.loading_container);
                $.post(
                    that.ajax, {
                    start_pos: (position - Math.floor(that.amount_per_page / 2)) > 0 ? (position > that.data.info.total_amount - Math.floor(that.amount_per_page / 2)) ? (that.data.info.total_amount - that.amount_per_page) : (position - Math.floor(that.amount_per_page / 2)) : 0,
                    limit: that.amount_per_page,
                    draw: that.draw,
                    filter: that.filter,
                    sort: that.sort
                },
                    function (data) {
                        if (data.draw == that.draw) {
                            that.data = data;
                            that.render(data);
                            that.start_pos = Math.floor(position / 10);
                        }
                    }
                )
            }
        }
    });
    $(document).on('mousedown', '.ld-datatable-move-handle', function (e) {
        if (!that.resizing_flag && !that.moving_flag) {
            that.moving_flag = true;
            var th = $(this).parent();
            var title = th.text();
            th.addClass('ld-datatable-move-helper');
            var width = th.outerWidth();
            that.ghost.outerWidth(width);
            $('.title', that.ghost).text(title);
            var th_pos = th.offset();
            that.table_container.parent().append(that.ghost);
            that.ghost.offset(th_pos);
            that.cur_pos = {
                top: e.pageY,
                left: e.pageX
            }
        }
    });
    $(document).on('mousedown', '.ld-datatable-resize-handle', function (e) {
        if (!that.resizing_flag && !that.moving_flag) {
            that.resizing_flag = true;
            var th = $(this).parent();
            th.addClass('ld-datatable-resizing-helper');
            that.cur_pos = {
                top: e.pageY,
                left: e.pageX
            }
        }
    });
    $(document).on('mousemove', function (e) {
        if (that.moving_flag === true || that.resizing_flag === true) {
            that.table.css('user-select', 'none');
            that.table_header.css('user-select', 'none');
        } 
        if (that.moving_flag === true) {
            var ghost_pos = that.ghost.offset();
            var current_offset = {
                top: ghost_pos.top + e.pageY - that.cur_pos.top,
                left: ghost_pos.left + e.pageX - that.cur_pos.left
            };
            that.ghost.offset(current_offset);
            that.cur_pos = {
                top: e.pageY,
                left: e.pageX
            }
            var ths = $('th', that.table_header).not('.ld-datatable-fixed');
            for (var i = 0; i < ths.length; i++) {
                if (that.cur_pos.left > ths.eq(i).offset().left) {
                    if (i < ths.length - 1 && that.cur_pos.left < ths.eq(i + 1).offset().left) {
                        ths.removeClass('ld-datatable-move-hover');
                        ths.eq(i).addClass('ld-datatable-move-hover');
                    } else if (i == ths.length - 1) {
                        ths.removeClass('ld-datatable-move-hover');
                        ths.eq(i).addClass('ld-datatable-move-hover');
                    }
                }
            }
        }
        if (that.resizing_flag == true) {
            var offset = e.pageX - that.cur_pos.left;
            that.cur_pos = {
                top: e.pageY,
                left: e.pageX
            }
            if (offset != 0) {
                if (offset < 0) {
                    var th = $('th.ld-datatable-resizing-helper', that.table_header);
                    var helper_index = $('th:not([style*="display: none"])', that.table_header).index(th[0]);
                    var tr = $('tr', that.table).eq(0);
                    var td = $('td', tr).eq(helper_index);
                    var width = th.outerWidth();
                    width = width + offset;
                    th.outerWidth(width);
                    td.outerWidth(width);
                }
                var container_width = that.table.outerWidth();
                container_width = container_width + offset;
                that.table_container.outerWidth(container_width + 18);
                that.table.outerWidth(container_width);
                if (container_width + 18 > parseInt(that.table_container.css('max-width'))) {
                    that.table_header.outerWidth(container_width + 18);
                    that.table_header.css('padding-right', '18px');
                } else {
                    that.table_header.css('padding-right', '0');
                    that.table_header.outerWidth(container_width);
                }
                if (offset > 0) {
                    var th = $('th.ld-datatable-resizing-helper', that.table_header);
                    var helper_index = $('th:not([style*="display: none"])', that.table_header).index(th[0]);
                    var tr = $('tr', that.table).eq(0);
                    var td = $('td', tr).eq(helper_index);
                    var width = th.outerWidth();
                    width = width + offset;
                    th.outerWidth(width);
                    td.outerWidth(width);
                }
            }
        }
    });
    $(document).on('mouseup', function (e) {
        that.table.css('user-select', 'initial');
        that.table_header.css('user-select', 'initial');
        if (that.moving_flag) {
            that.moving_flag = false;
            that.ghost.remove();
            var before = false;
            var helper = $('th.ld-datatable-move-helper', that.table_header);
            var helper_index = $('th:not([style*="display: none"])', that.table_header).index(helper[0]);
            var move = $('th.ld-datatable-move-hover', that.table_header);
            var move_index = $('th:not([style*="display: none"])', that.table_header).index(move[0]);
            if (helper_index != move_index) {
                if (helper_index > move_index) {
                    before = true
                }
                var trs = $('tbody tr', that.table);
                for (var i = 0; i < trs.length; i++) {
                    var tr = trs.eq(i);
                    var cell_helper = $('td', tr).eq(helper_index);
                    var cell_move = $('td', tr).eq(move_index);
                    if (before) {
                        cell_helper.insertBefore(cell_move);
                    } else {
                        cell_helper.insertAfter(cell_move);
                    }
                }
                if (before) {
                    helper.insertBefore(move);
                } else {
                    helper.insertAfter(move);
                }
            }
            helper.removeClass('ld-datatable-move-helper');
            move.removeClass('ld-datatable-move-hover');
            that.table.trigger('reorderCompleted');
        }
        if (that.resizing_flag) {
            that.resizing_flag = false;
            var th = $('th.ld-datatable-resizing-helper', that.table_header);
            th.removeClass('ld-datatable-resizing-helper');
            that.table.trigger('resizeCompleted');
        }
    });
}
DataTable.prototype.filter = function (filter) {
    var that = this;
    that.filter = {...that.filter, filter};
    $.post(
        that.ajax, {
        start_pos: that.start_pos,
        limit: that.amount_per_page,
        filter: filter,
        sort: that.sort
    },
        function (data) {
            that.data = data;
            that.render();
        }
    )
}

DataTable.prototype.sort = function (sort) {
    var that = this;
    that.sort = {...that.sort, sort};
    $.post(
        that.ajax, {
        start_pos: that.start_pos,
        limit: that.amount_per_page,
        filter: that.filter,
        sort: that.sort
    },
        function (data) {
            that.data = data;
            that.render();
        }
    )
}

DataTable.prototype.hideColumn = function (hide) {
    this.hide = hide;
    this.render();
}

DataTable.prototype.render = function () {
    var headers = $('thead th', this.table_header);
    var order = [];
    var that = this;
    var j = 0;
    var bool_first_time = false;
    if (headers.length) {
        headers.show();
        for (var i = 0; i < headers.length; i ++) {
            field_name = headers.eq(i).attr('field_name');
            if (that.hide.indexOf(field_name) == -1) {
                order[j] = headers.eq(i).attr('field_name');
                j ++;
            } else {
                headers.eq(i).hide();
            }
        }
    } else {
        bool_first_time = true;
        var head = $('<thead></thead>');
        var tr = $('<tr></tr>');
        var select_column = $('<select multiple class="ld-datatable-column-select"></select>');
        head.append(tr);
        that.table_header.append(head);
        i = 0;
        Object.entries(that.data.fields).forEach((field) => {
            var th = $('<th field_name=' + field[0] + '>' + field[1] + '</th>');
            tr.append(th);
            var option = $('<option value="' + field[0] + '">' + field[1] + '</option>');
            select_column.append(option);
            if (that.hide.indexOf(field[0]) == -1) {
                order[i] = field[0];
            } else {
                th.hide();
            }
            if (i == 0) {
                th.addClass('ld-datatable-fixed');
            }
            i ++;
        });
        var select_container = $('<div class="ld-datatable-column-filter"></div>');
        that.table_container.parent().prepend(select_container);
        select_container.append(select_column);
        select_column.on('change', function() {
            that.hideColumn(select_column.val());
        })
    }
    var body = $('tbody', that.table);
    if (!body.length) {
        body = $('<tbody></tbody>');
        this.table.append(body);
    }
    body.empty();
    for(j = 0; j < this.data.data.length; j ++) {
        var data = this.data.data[j]
        var tr = $('<tr></tr>');
        body.append(tr);
        for (var k = 0; k < order.length; k ++) {
            td = $('<td>' + data[order[k]] + '</th>');
            if (k == 0) {
                td.addClass('ld-datatable-fixed');
            }
            tr.append(td);
        }
    }

    if (bool_first_time) {
        var tr = $('tr', body).eq(0);
        var thead_ths = $('th', this.table_header);
        var tds = $('td', tr);
        for(var i = 0; i < tds.length; i ++) {
            var width = tds.eq(i).width();
            if (width < 80) {
                width = 80;    
            }
            tds.eq(i).width(width);
            thead_ths.eq(i).width(width);
        }
    } else {
        var tr = $('tr', body).eq(0);
        var thead_ths = $('th', this.table_header);
        var tds = $('td', tr);
        for(var i = 0; i < thead_ths.length; i ++) {
            var width = thead_ths.eq(i).width();
            tds.eq(i).width(width);
        }
    }
    if (this.row_height != 40) {
        $('tr', this.table).height(this.row_height);
        $('tr', this.table_header).height(this.row_height);
    }
}