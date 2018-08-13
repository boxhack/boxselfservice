function delete_event(columns) {
    this.event_type = columns[0].value;
    this.created_at = columns[1].value;
    this.source_id = columns[2].value;
    this.source_name = columns[3].value;
    this.source_login = columns[4].value;
    this.created_by_id = columns[5].value;
    this.created_by_name = columns[6].value;
    this.created_by_login = columns[7].value;
    this.additional_details_service_name = columns[8].value;
}

module.exports = delete_event;