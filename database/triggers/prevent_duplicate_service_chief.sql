DELIMITER //

CREATE TRIGGER before_employee_service_update 
BEFORE UPDATE ON employes
FOR EACH ROW 
BEGIN
    -- If there's an existing chief for this service, clear their dirige_service_id
    IF NEW.dirige_service_id IS NOT NULL THEN
        UPDATE employes 
        SET dirige_service_id = NULL 
        WHERE dirige_service_id = NEW.dirige_service_id 
        AND id != NEW.id;
    END IF;
END//

CREATE TRIGGER before_employee_service_insert
BEFORE INSERT ON employes
FOR EACH ROW 
BEGIN
    -- If there's an existing chief for this service, clear their dirige_service_id
    IF NEW.dirige_service_id IS NOT NULL THEN
        UPDATE employes 
        SET dirige_service_id = NULL 
        WHERE dirige_service_id = NEW.dirige_service_id;
    END IF;
END//

DELIMITER ;
