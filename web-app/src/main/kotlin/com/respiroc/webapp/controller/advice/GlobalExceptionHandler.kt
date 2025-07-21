package com.respiroc.webapp.controller.advice

import com.respiroc.util.exception.MissingTenantContextException
import com.respiroc.webapp.controller.BaseController
import com.respiroc.webapp.controller.response.Callout
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.multipart.MaxUploadSizeExceededException
import org.springframework.web.servlet.ModelAndView

@ControllerAdvice
class GlobalExceptionHandler : BaseController() {

    @ExceptionHandler(MissingTenantContextException::class)
    fun handleMissingTenantContext(): ModelAndView {
        return ModelAndView("redirect:/tenant/create")
    }

    @ExceptionHandler(MaxUploadSizeExceededException::class)
    fun handleMaxSizeException(ex: MaxUploadSizeExceededException, model: Model): String {
        model.addAttribute("callout", Callout.Error("File size exceeds the maximum allowed limit!"))
        return "fragments/callout-message"
    }
}